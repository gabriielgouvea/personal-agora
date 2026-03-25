import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

// Listar cupons
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const cupons = await prisma.cupom.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cupons);
}

// Criar cupom
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { codigo, tipo, valor, validade, limiteUsos } = await req.json();

  if (!codigo || !tipo || valor === undefined) {
    return NextResponse.json({ error: "Código, tipo e valor são obrigatórios" }, { status: 400 });
  }

  if (!["percentual", "fixo"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo deve ser 'percentual' ou 'fixo'" }, { status: 400 });
  }

  const existing = await prisma.cupom.findUnique({ where: { codigo } });
  if (existing) {
    return NextResponse.json({ error: "Já existe um cupom com esse código" }, { status: 409 });
  }

  const cupom = await prisma.cupom.create({
    data: {
      codigo: codigo.toUpperCase(),
      tipo,
      valor: parseFloat(valor),
      validade: validade ? new Date(validade) : null,
      limiteUsos: limiteUsos ? parseInt(limiteUsos) : 1,
    },
  });

  return NextResponse.json(cupom, { status: 201 });
}
