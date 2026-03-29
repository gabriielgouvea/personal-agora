import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH /api/aulas/[id]/aceitar — personal aceita/confirma o agendamento da aula
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const aula = await prisma.aula.findUnique({
    where: { id: params.id },
    include: {
      aluno: { select: { id: true, nome: true, sobrenome: true, email: true } },
      personal: {
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          advertencias: {
            where: {
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            select: { id: true, tipo: true, descricao: true, pontos: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!aula) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  if (aula.personalId !== session.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  if (aula.status !== "paga") {
    return NextResponse.json({ error: "Esta aula não pode ser aceita neste status" }, { status: 400 });
  }

  const agora = new Date();
  await prisma.aula.update({
    where: { id: params.id },
    data: {
      status: "aceita",
      aceitaPersonalAt: agora,
    },
  });

  // Notificar aluno que o personal aceitou
  try {
    const { sendAulaAceitaAluno } = await import("@/lib/email");
    await sendAulaAceitaAluno(
      aula.aluno.email,
      aula.aluno.nome,
      `${aula.personal.nome} ${aula.personal.sobrenome}`,
      aula.valor,
      aula.id,
    );
  } catch (e) {
    console.error("Erro ao enviar email de aceitação:", e);
  }

  const advertencias = aula.personal.advertencias;

  return NextResponse.json({
    ok: true,
    status: "aceita",
    advertencias: advertencias.length,
    mensagem: "Aula aceita com sucesso! O aluno foi notificado.",
  });
}
