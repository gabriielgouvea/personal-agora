import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getAsaasSubscription,
  getSubscriptionPayments,
  AsaasPayment,
} from "@/lib/asaas";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      plano: true,
      planoAtivo: true,
      planoInicio: true,
      planoFim: true,
      asaasSubscriptionId: true,
      cancelamentoPedidoEm: true,
      cancelamentoMotivo: true,
    },
  });

  if (!user) return NextResponse.json(null, { status: 401 });

  // Se não tem assinatura no Asaas (ex: veio por convite)
  if (!user.asaasSubscriptionId) {
    return NextResponse.json({
      plano: user.plano,
      planoAtivo: user.planoAtivo,
      planoFim: user.planoFim,
      semAsaas: true,
      cancelamentoPedidoEm: user.cancelamentoPedidoEm,
    });
  }

  try {
    const [subscription, payments] = await Promise.all([
      getAsaasSubscription(user.asaasSubscriptionId),
      getSubscriptionPayments(user.asaasSubscriptionId),
    ]);

    const overdue: AsaasPayment[] = payments.filter((p) => p.status === "OVERDUE");
    const pending: AsaasPayment[] = payments.filter((p) => p.status === "PENDING");

    return NextResponse.json({
      plano: user.plano,
      planoAtivo: user.planoAtivo,
      planoFim: user.planoFim,
      semAsaas: false,
      asaasStatus: subscription.status,
      nextDueDate: subscription.nextDueDate,
      value: subscription.value,
      cancelamentoPedidoEm: user.cancelamentoPedidoEm,
      cancelamentoMotivo: user.cancelamentoMotivo,
      overdue,
      pending,
    });
  } catch {
    // Asaas fora do ar ou assinatura não encontrada
    return NextResponse.json({
      plano: user.plano,
      planoAtivo: user.planoAtivo,
      planoFim: user.planoFim,
      semAsaas: false,
      asaasStatus: null,
      nextDueDate: null,
      value: null,
      cancelamentoPedidoEm: user.cancelamentoPedidoEm,
      cancelamentoMotivo: user.cancelamentoMotivo,
      overdue: [],
      pending: [],
    });
  }
}
