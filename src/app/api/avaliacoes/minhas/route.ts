import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/avaliacoes/minhas — personal lista avaliações recebidas (para gerenciar visibilidade)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const avaliacoes = await prisma.avaliacao.findMany({
    where: {
      avaliadoId: session.userId,
      tipo: "aluno_para_personal",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nota: true,
      comentario: true,
      visivelNoPerfil: true,
      createdAt: true,
      autor: {
        select: { nome: true, sobrenome: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json(avaliacoes);
}
