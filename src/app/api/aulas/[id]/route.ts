import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const aula = await prisma.aula.findUnique({
    where: { id: params.id },
    include: {
      personal: {
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          avatarUrl: true,
          telefone: true,
          isWhatsapp: true,
          email: true,
        },
      },
      aluno: {
        select: { id: true },
      },
    },
  });

  if (!aula) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  // Só o aluno dono da aula pode ver
  if (aula.alunoId !== session.userId && aula.personalId !== session.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  return NextResponse.json(aula);
}
