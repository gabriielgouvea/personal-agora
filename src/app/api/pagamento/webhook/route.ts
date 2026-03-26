import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verificar token de segurança do Asaas (configurado no painel → Integrações → Webhooks)
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (webhookToken) {
      const receivedToken = req.headers.get("asaas-access-token");
      if (receivedToken !== webhookToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const event: string = body.event;
    const payment = body.payment;

    if (!event || !payment) {
      return NextResponse.json({ received: true });
    }

    // Pagamento confirmado ou recebido
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const subscriptionId: string | null = payment.subscription ?? null;

      if (subscriptionId) {
        const user = await prisma.user.findFirst({
          where: { asaasSubscriptionId: subscriptionId },
          select: { id: true, plano: true },
        });

        if (user) {
          const agora = new Date();
          const fim = new Date(agora);
          fim.setMonth(fim.getMonth() + 1);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              planoAtivo: true,
              planoInicio: agora,
              planoFim: fim,
            },
          });
        }
      }
    }

    // Assinatura cancelada ou pagamento vencido → desativar plano
    if (
      event === "PAYMENT_OVERDUE" ||
      event === "SUBSCRIPTION_INACTIVATED"
    ) {
      const subscriptionId: string | null =
        payment?.subscription ?? body.subscription?.id ?? null;

      if (subscriptionId) {
        await prisma.user.updateMany({
          where: { asaasSubscriptionId: subscriptionId },
          data: { planoAtivo: false },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook Asaas error:", err);
    return NextResponse.json({ received: true }); // Sempre retorna 200 para o Asaas não reenviar
  }
}
