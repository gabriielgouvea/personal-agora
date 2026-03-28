import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const modalidade = searchParams.get("modalidade") || "";
  const regiao = searchParams.get("regiao") || "";
  const academia = searchParams.get("academia") || "";
  const nome = searchParams.get("nome") || "";
  const casa = searchParams.get("casa") === "1";

  const where: Prisma.UserWhereInput = {
    tipo: { in: ["personal", "ambos"] },
    status: "ativo",
  };

  if (modalidade) {
    where.modalidades = { contains: modalidade, mode: "insensitive" };
  }
  if (regiao) {
    where.regioes = { contains: regiao, mode: "insensitive" };
  }
  if (academia) {
    where.academias = { contains: academia, mode: "insensitive" };
  }
  if (casa) {
    where.disponivelEmCasa = true;
  }

  let trainers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      avatarUrl: true,
      modalidades: true,
      regioes: true,
      academias: true,
      valorAproximado: true,
      disponivelEmCasa: true,
      preferenciaGeneroAluno: true,
      telefone: true,
      isWhatsapp: true,
      asaasCustomerId: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Filtro por nome (JS, case-insensitive)
  if (nome) {
    const q = nome.toLowerCase();
    trainers = trainers.filter(
      (t) =>
        t.nome.toLowerCase().includes(q) ||
        t.sobrenome.toLowerCase().includes(q)
    );
  }

  // Buscar médias de avaliação dos personais retornados
  const ids = trainers.map((t) => t.id);
  const ratings = await prisma.avaliacao.groupBy({
    by: ["avaliadoId"],
    where: {
      avaliadoId: { in: ids },
      tipo: "aluno_para_personal",
      visivelNoPerfil: true,
    },
    _avg: { nota: true },
    _count: { nota: true },
  });
  const ratingMap = new Map(ratings.map((r) => [r.avaliadoId, { media: r._avg.nota ?? 0, total: r._count.nota }]));

  const result = trainers.map((t) => ({
    ...t,
    rating: ratingMap.get(t.id) ?? { media: 0, total: 0 },
  }));

  return NextResponse.json(result);
}
