import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPaymentCheckoutUrl } from "@/lib/asaas";

const schema = z.object({
  paymentId: z.string().min(1),
  billingType: z.enum(["CREDIT_CARD", "PIX"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { asaasSubscriptionId: true },
  });

  if (!user?.asaasSubscriptionId) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const url = await getPaymentCheckoutUrl(result.data.paymentId, result.data.billingType);
    if (!url) {
      return NextResponse.json({ error: "Link de pagamento não disponível" }, { status: 404 });
    }
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Erro ao gerar link de pagamento:", err);
    return NextResponse.json({ error: "Erro ao gerar link de pagamento" }, { status: 500 });
  }
}
