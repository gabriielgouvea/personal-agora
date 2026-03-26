import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  createOrFindAsaasCustomer,
  createAsaasSubscription,
  getSubscriptionPaymentUrl,
} from "@/lib/asaas";
import { isValidCPF } from "@/lib/utils";

const schema = z.object({
  billingType: z.enum(["PIX", "CREDIT_CARD"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      email: true,
      cpf: true,
      plano: true,
      asaasSubscriptionId: true,
      asaasCustomerId: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!user.cpf) return NextResponse.json({ error: "CPF não cadastrado" }, { status: 400 });
  if (!isValidCPF(user.cpf)) {
    return NextResponse.json(
      { error: "O CPF cadastrado não é válido. Corrija seus dados pessoais antes de ativar a assinatura." },
      { status: 422 }
    );
  }

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // Se já tem assinatura ativa no Asaas, só retorna o link de pagamento pendente
  if (user.asaasSubscriptionId) {
    try {
      const paymentUrl = await getSubscriptionPaymentUrl(user.asaasSubscriptionId);
      if (paymentUrl) return NextResponse.json({ paymentUrl });
    } catch {
      // continua para criar nova
    }
  }

  // Cria cliente e assinatura no Asaas
  try {
    const customerId = await createOrFindAsaasCustomer(
      user.nome,
      user.sobrenome,
      user.email,
      user.cpf
    );
    const subscriptionId = await createAsaasSubscription(
      customerId,
      user.plano || "pro",
      result.data.billingType
    );
    const paymentUrl = await getSubscriptionPaymentUrl(subscriptionId);

    await prisma.user.update({
      where: { id: user.id },
      data: { asaasCustomerId: customerId, asaasSubscriptionId: subscriptionId },
    });

    if (!paymentUrl) {
      return NextResponse.json(
        { error: "Assinatura criada, mas não foi possível obter o link de pagamento. Aguarde alguns instantes e tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao criar assinatura.";
    console.error("Erro ao ativar assinatura:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
