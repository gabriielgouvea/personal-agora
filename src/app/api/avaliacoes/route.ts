import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/avaliacoes — criar avaliação após aula confirmada
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { aulaId, nota, comentario } = body as {
    aulaId?: string;
    nota?: number;
    comentario?: string;
  };

  if (!aulaId || !nota || nota < 1 || nota > 5) {
    return NextResponse.json({ error: "Dados inválidos. Nota de 1 a 5 e aulaId obrigatório." }, { status: 400 });
  }

  // Buscar aula
  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
    select: { id: true, alunoId: true, personalId: true, status: true },
  });

  if (!aula) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  if (aula.status !== "confirmada") {
    return NextResponse.json({ error: "Só é possível avaliar após a aula ser confirmada" }, { status: 400 });
  }

  // Determinar tipo e avaliado
  let tipo: string;
  let avaliadoId: string;

  if (session.userId === aula.alunoId) {
    tipo = "aluno_para_personal";
    avaliadoId = aula.personalId;
  } else if (session.userId === aula.personalId) {
    tipo = "personal_para_aluno";
    avaliadoId = aula.alunoId;
  } else {
    return NextResponse.json({ error: "Você não participa desta aula" }, { status: 403 });
  }

  // Verificar se já avaliou esta aula
  const jaAvaliou = await prisma.avaliacao.findUnique({
    where: { aulaId_autorId: { aulaId, autorId: session.userId } },
  });

  if (jaAvaliou) {
    return NextResponse.json({ error: "Você já avaliou esta aula" }, { status: 409 });
  }

  const avaliacao = await prisma.avaliacao.create({
    data: {
      aulaId,
      autorId: session.userId,
      avaliadoId,
      nota: Math.round(nota),
      comentario: comentario?.trim() || null,
      tipo,
      visivelNoPerfil: true,
    },
  });

  return NextResponse.json(avaliacao);
}
