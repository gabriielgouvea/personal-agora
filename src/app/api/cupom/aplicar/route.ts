import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { codigo } = await req.json();

  if (!codigo) {
    return NextResponse.json({ error: "Código do cupom é obrigatório" }, { status: 400 });
  }

  const cupom = await prisma.cupom.findUnique({ where: { codigo } });

  if (!cupom) {
    return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
  }

  if (!cupom.ativo) {
    return NextResponse.json({ error: "Este cupom não está mais ativo" }, { status: 400 });
  }

  if (cupom.validade && new Date() > cupom.validade) {
    return NextResponse.json({ error: "Este cupom expirou" }, { status: 400 });
  }

  if (cupom.usosAtuais >= cupom.limiteUsos) {
    return NextResponse.json({ error: "Este cupom atingiu o limite de usos" }, { status: 400 });
  }

  return NextResponse.json({
    valido: true,
    codigo: cupom.codigo,
    tipo: cupom.tipo,
    valor: cupom.valor,
    descricao:
      cupom.tipo === "percentual"
        ? `${cupom.valor}% de desconto`
        : `R$ ${cupom.valor.toFixed(2)} de desconto`,
  });
}
