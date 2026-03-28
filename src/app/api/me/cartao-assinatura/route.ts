import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getAsaasSubscription,
  updateSubscriptionCreditCard,
  removeSubscriptionCreditCard,
  CreditCardData,
  CreditCardHolderInfo,
} from "@/lib/asaas";

// GET — retorna dados do cartão cadastrado na assinatura
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { asaasSubscriptionId: true, tipo: true },
  });

  if (!user || (user.tipo !== "personal" && user.tipo !== "ambos")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  if (!user.asaasSubscriptionId) {
    return NextResponse.json({ billingType: null, creditCardNumber: null, creditCardBrand: null });
  }

  try {
    const sub = await getAsaasSubscription(user.asaasSubscriptionId);
    return NextResponse.json({
      billingType: sub.billingType,
      creditCardNumber: sub.creditCardNumber ?? null,
      creditCardBrand: sub.creditCardBrand ?? null,
    });
  } catch {
    return NextResponse.json({ billingType: null, creditCardNumber: null, creditCardBrand: null });
  }
}

// POST — cadastra ou troca o cartão da assinatura
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      asaasSubscriptionId: true, tipo: true,
      nome: true, sobrenome: true, email: true,
      cpf: true, cep: true, numero: true, telefone: true,
    },
  });

  if (!user || (user.tipo !== "personal" && user.tipo !== "ambos")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  if (!user.asaasSubscriptionId) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  const body = await req.json();
  const { holderName, number, expiryMonth, expiryYear, ccv } = body;

  if (!holderName || !number || !expiryMonth || !expiryYear || !ccv) {
    return NextResponse.json({ error: "Preencha todos os dados do cartão" }, { status: 400 });
  }

  const creditCard: CreditCardData = {
    holderName: holderName.trim(),
    number: number.replace(/\s/g, ""),
    expiryMonth,
    expiryYear,
    ccv,
  };

  const creditCardHolderInfo: CreditCardHolderInfo = {
    name: `${user.nome} ${user.sobrenome}`.trim(),
    email: user.email,
    cpfCnpj: (user.cpf ?? "").replace(/\D/g, ""),
    postalCode: (user.cep ?? "").replace(/\D/g, ""),
    addressNumber: user.numero ?? "0",
    phone: (user.telefone ?? "").replace(/\D/g, ""),
  };

  try {
    const result = await updateSubscriptionCreditCard(
      user.asaasSubscriptionId,
      creditCard,
      creditCardHolderInfo
    );
    return NextResponse.json({
      creditCardNumber: result.creditCardNumber,
      creditCardBrand: result.creditCardBrand,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao atualizar cartão";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// DELETE — remove o cartão da assinatura (volta a PIX/invoice)
export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { asaasSubscriptionId: true, tipo: true },
  });

  if (!user || (user.tipo !== "personal" && user.tipo !== "ambos")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  if (!user.asaasSubscriptionId) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  try {
    await removeSubscriptionCreditCard(user.asaasSubscriptionId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao remover cartão";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
