import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/avaliacoes/aluno/[id] — avaliações de um aluno (só personais veem)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Apenas personais podem ver avaliações de alunos
  if (session.tipo !== "personal" && session.tipo !== "ambos") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const avaliacoes = await prisma.avaliacao.findMany({
    where: {
      avaliadoId: params.id,
      tipo: "personal_para_aluno",
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

  const total = avaliacoes.length;
  const media = total > 0 ? avaliacoes.reduce((s, a) => s + a.nota, 0) / total : 0;

  return NextResponse.json({ avaliacoes, media: Math.round(media * 10) / 10, total });
}
