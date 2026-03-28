import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/avaliacoes/personal/[id] — avaliações públicas de um personal
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const avaliacoes = await prisma.avaliacao.findMany({
    where: {
      avaliadoId: params.id,
      tipo: "aluno_para_personal",
      visivelNoPerfil: true,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nota: true,
      comentario: true,
      createdAt: true,
      autor: {
        select: { nome: true, sobrenome: true, avatarUrl: true },
      },
    },
  });

  // Calcular média
  const total = avaliacoes.length;
  const media = total > 0 ? avaliacoes.reduce((s, a) => s + a.nota, 0) / total : 0;

  return NextResponse.json({ avaliacoes, media: Math.round(media * 10) / 10, total });
}
