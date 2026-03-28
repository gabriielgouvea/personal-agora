import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST — solicita um saque
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { tipo: true },
  });

  if (!user || (user.tipo !== "personal" && user.tipo !== "ambos")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { valor, destino, chavePix, banco, agencia, contaNumero, tipoConta } = body;

  if (!valor || typeof valor !== "number" || valor <= 0) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }
  if (destino !== "pix" && destino !== "banco") {
    return NextResponse.json({ error: "Destino inválido" }, { status: 400 });
  }
  if (destino === "pix" && !chavePix) {
    return NextResponse.json({ error: "Informe a chave PIX" }, { status: 400 });
  }
  if (destino === "banco" && (!banco || !agencia || !contaNumero || !tipoConta)) {
    return NextResponse.json({ error: "Preencha todos os dados bancários" }, { status: 400 });
  }

  // Calcula saldo disponível
  const ganhos = await prisma.aula.aggregate({
    where: { personalId: session.userId, status: "confirmada" },
    _sum: { valor: true },
  });
  const sacado = await prisma.saque.aggregate({
    where: {
      personalId: session.userId,
      status: { in: ["pago", "processando"] },
    },
    _sum: { valor: true },
  });

  const saldoDisponivel = (ganhos._sum.valor ?? 0) - (sacado._sum.valor ?? 0);

  if (valor > saldoDisponivel) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
  }

  const saque = await prisma.saque.create({
    data: {
      personalId: session.userId,
      valor,
      destino,
      chavePix: destino === "pix" ? chavePix : null,
      banco: destino === "banco" ? banco : null,
      agencia: destino === "banco" ? agencia : null,
      contaNumero: destino === "banco" ? contaNumero : null,
      tipoConta: destino === "banco" ? tipoConta : null,
      status: "pendente",
    },
  });

  return NextResponse.json(saque, { status: 201 });
}
