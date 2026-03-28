import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/alunos/[id] — personal visualiza perfil do aluno (LGPD: sem CPF, sem endereço)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Apenas personais podem ver perfil de alunos
  if (session.tipo !== "personal" && session.tipo !== "ambos") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // Verificar se o personal tem (ou já teve) aula com este aluno
  const temRelacao = await prisma.aula.findFirst({
    where: {
      personalId: session.userId,
      alunoId: params.id,
      status: { in: ["paga", "confirmada"] },
    },
  });

  if (!temRelacao) {
    return NextResponse.json(
      { error: "Você só pode ver o perfil de alunos que já contrataram aulas com você." },
      { status: 403 }
    );
  }

  const aluno = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      avatarUrl: true,
      telefone: true,
      isWhatsapp: true,
      email: true,
      dataNascimento: true,
      sexo: true,
      esportes: true,
      academias: true,
      temWellhub: true,
      temTotalPass: true,
      experiencia: true,
      tempoTreino: true,
      parqRespostas: true,
      parqPreenchidoEm: true,
      isPCD: true,
      tipoDeficiencia: true,
      createdAt: true,
      // NÃO retorna: cpf, cep, rua, bairro, cidade, estado, numero, complemento (LGPD)
    },
  });

  if (!aluno) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  // Buscar histórico de aulas entre este personal e aluno
  const aulas = await prisma.aula.findMany({
    where: {
      personalId: session.userId,
      alunoId: params.id,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      valor: true,
      status: true,
      formaPagamento: true,
      paidAt: true,
      confirmedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ...aluno, aulas });
}
