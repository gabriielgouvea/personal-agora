import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createOrFindAsaasCustomer, createAsaasSubscription, getSubscriptionPaymentUrl } from "@/lib/asaas";
import { isValidCPF } from "@/lib/utils";
import { getAdminSession } from "@/lib/admin-auth";

const bodySchema = z.object({
  userId: z.string().min(1),
  billingType: z.enum(["PIX", "CREDIT_CARD"]),
  desconto: z.number().min(0).max(100).optional(), // percentual
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const result = bodySchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { userId, billingType, desconto } = result.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nome: true, sobrenome: true, email: true, cpf: true, plano: true, asaasCustomerId: true },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  if (!user.cpf) return NextResponse.json({ error: "Usuário sem CPF cadastrado" }, { status: 400 });
  if (!isValidCPF(user.cpf)) return NextResponse.json({ error: "CPF inválido" }, { status: 400 });

  const plano = user.plano || "pro";
  const PLAN_VALUES: Record<string, number> = { start: 29.9, pro: 49.9, elite: 99.9 };
  const baseValue = PLAN_VALUES[plano] ?? 49.9;
  const discountValue = desconto ? parseFloat((baseValue * (desconto / 100)).toFixed(2)) : undefined;

  try {
    const customerId = await createOrFindAsaasCustomer(
      user.nome,
      user.sobrenome ?? "",
      user.email,
      user.cpf
    );

    const subscriptionId = await createAsaasSubscription(customerId, plano, billingType, discountValue);
    const paymentUrl = await getSubscriptionPaymentUrl(subscriptionId);

    await prisma.user.update({
      where: { id: user.id },
      data: { asaasCustomerId: customerId, asaasSubscriptionId: subscriptionId },
    });

    return NextResponse.json({ paymentUrl, plano, valorFinal: discountValue ? parseFloat((baseValue - discountValue).toFixed(2)) : baseValue });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao gerar link" }, { status: 500 });
  }
}
