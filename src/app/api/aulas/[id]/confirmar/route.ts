import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH /api/aulas/[id]/confirmar — aluno confirma que a aula aconteceu
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
      personal: { select: { id: true, nome: true, sobrenome: true, email: true } },
    },
  });

  if (!aula) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  if (aula.alunoId !== session.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  if (aula.status !== "paga") {
    return NextResponse.json({ error: "Aula não pode ser confirmada neste status" }, { status: 400 });
  }

  const agora = new Date();
  await prisma.aula.update({
    where: { id: params.id },
    data: {
      status: "confirmada",
      confirmedAt: agora,
      releasedAt: agora,
    },
  });

  // Notificar admin sobre liberação de pagamento (importação inline para evitar circular)
  try {
    const { sendAulaConfirmadaAdmin } = await import("@/lib/email");
    await sendAulaConfirmadaAdmin(
      `${aula.aluno.nome} ${aula.aluno.sobrenome}`,
      aula.personal.nome,
      aula.personal.email,
      aula.valor,
      aula.id,
    );
  } catch (e) {
    console.error("Erro ao enviar email de liberação:", e);
  }

  return NextResponse.json({ ok: true, status: "confirmada" });
}
