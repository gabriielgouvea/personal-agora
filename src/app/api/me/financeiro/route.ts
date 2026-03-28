import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — retorna saldo disponível + histórico de saques
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { tipo: true },
  });

  if (!user || (user.tipo !== "personal" && user.tipo !== "ambos")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  // Total ganho = soma das aulas confirmadas
  const ganhos = await prisma.aula.aggregate({
    where: { personalId: session.userId, status: "confirmada" },
    _sum: { valor: true },
  });

  // Total sacado/em processo = saques pago ou processando
  const sacado = await prisma.saque.aggregate({
    where: {
      personalId: session.userId,
      status: { in: ["pago", "processando"] },
    },
    _sum: { valor: true },
  });

  const totalEarned = ganhos._sum.valor ?? 0;
  const totalWithdrawn = sacado._sum.valor ?? 0;
  const saldoDisponivel = totalEarned - totalWithdrawn;

  const saques = await prisma.saque.findMany({
    where: { personalId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ totalEarned, totalWithdrawn, saldoDisponivel, saques });
}
