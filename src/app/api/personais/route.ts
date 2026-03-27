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

  return NextResponse.json(trainers);
}
