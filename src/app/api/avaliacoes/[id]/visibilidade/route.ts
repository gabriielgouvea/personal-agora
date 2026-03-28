import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH /api/avaliacoes/[id]/visibilidade — personal alterna visibilidade da avaliação no perfil
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: params.id },
  });

  if (!avaliacao) return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });

  // Só o personal avaliado pode alterar visibilidade
  if (avaliacao.avaliadoId !== session.userId || avaliacao.tipo !== "aluno_para_personal") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const updated = await prisma.avaliacao.update({
    where: { id: params.id },
    data: { visivelNoPerfil: !avaliacao.visivelNoPerfil },
  });

  return NextResponse.json({ visivelNoPerfil: updated.visivelNoPerfil });
}
