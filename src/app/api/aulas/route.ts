import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createOrFindAsaasCustomer, createAsaasCharge } from "@/lib/asaas";

// POST /api/aulas — cria reserva + cobrança Asaas
export async function POST(req: NextRequest) {
  try {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (session.tipo !== "aluno" && session.tipo !== "ambos") {
    return NextResponse.json({ error: "Apenas alunos podem contratar aulas" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { personalId, billingType = "UNDEFINED", codigoCupom } = body as {
    personalId?: string;
    billingType?: "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED";
    codigoCupom?: string;
  };

  if (!personalId) return NextResponse.json({ error: "personalId obrigatório" }, { status: 400 });

  // Buscar personal
  const personal = await prisma.user.findFirst({
    where: { id: personalId, tipo: { in: ["personal", "ambos"] }, status: "ativo" },
    select: { id: true, nome: true, sobrenome: true, email: true, cpf: true, valorAproximado: true, asaasCustomerId: true },
  });
  if (!personal) return NextResponse.json({ error: "Personal não encontrado" }, { status: 404 });

  const valorStr = personal.valorAproximado?.replace(/[^0-9,\.]/g, "").replace(",", ".") ?? "0";
  let valor = parseFloat(valorStr);
  if (!valor || valor <= 0) {
    return NextResponse.json({ error: "Personal sem valor definido" }, { status: 400 });
  }

  // Processar cupom de desconto (se informado)
  let cupomAplicado: string | null = null;
  if (codigoCupom) {
    const cupom = await prisma.cupom.findUnique({ where: { codigo: codigoCupom } });
    if (cupom && cupom.ativo && cupom.usosAtuais < cupom.limiteUsos &&
        (!cupom.validade || cupom.validade > new Date())) {
      await prisma.cupom.update({
        where: { id: cupom.id },
        data: { usosAtuais: { increment: 1 } },
      });
      if (cupom.tipo === "percentual") {
        valor = parseFloat((valor * (1 - cupom.valor / 100)).toFixed(2));
      } else {
        valor = parseFloat(Math.max(valor - cupom.valor, 0).toFixed(2));
      }
      cupomAplicado = cupom.codigo;
    }
  }

  // Buscar aluno completo (para Asaas)
  const aluno = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, nome: true, sobrenome: true, email: true, cpf: true, asaasCustomerId: true },
  });
  if (!aluno) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (!aluno.cpf || aluno.cpf.replace(/\D/g, "").length !== 11) {
    return NextResponse.json(
      { error: "CPF não cadastrado. Atualize seu perfil antes de contratar." },
      { status: 400 }
    );
  }

  // Criar/encontrar customer Asaas do aluno
  let alunoCustomerId = aluno.asaasCustomerId;
  if (!alunoCustomerId) {
    alunoCustomerId = await createOrFindAsaasCustomer(
      aluno.nome,
      aluno.sobrenome,
      aluno.email,
      aluno.cpf,
    );
    await prisma.user.update({
      where: { id: aluno.id },
      data: { asaasCustomerId: alunoCustomerId },
    });
  }

  // Criar registro de aula (id necessário para externalReference)
  const aula = await prisma.aula.create({
    data: {
      alunoId: aluno.id,
      personalId: personal.id,
      valor,
      status: "aguardando_pagamento",
      formaPagamento: billingType === "CREDIT_CARD" ? "CREDIT_CARD" : billingType === "PIX" ? "PIX" : billingType === "BOLETO" ? "BOLETO" : null,
    },
  });

  // Para CREDIT_CARD transparente, retorna apenas a aula — 
  // o pagamento será feito via /api/aulas/[id]/pagar-cartao com os dados do cartão.
  if (billingType === "CREDIT_CARD") {
    return NextResponse.json({ aulaId: aula.id });
  }

  // Criar cobrança avulsa no Asaas (PIX / BOLETO / UNDEFINED)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);
  const dueDateStr = dueDate.toISOString().split("T")[0];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://personal-agora.vercel.app";
  const callbackSuccessUrl = `${appUrl}/dashboard/aluno/aulas/sucesso?aulaId=${aula.id}`;

  const charge = await createAsaasCharge(
    alunoCustomerId,
    valor,
    dueDateStr,
    `Aula com ${personal.nome} - Personal Agora`,
    aula.id,
    billingType,
    callbackSuccessUrl,
  );

  // Salvar chargeId e paymentUrl na aula
  await prisma.aula.update({
    where: { id: aula.id },
    data: {
      asaasChargeId: charge.id,
      paymentUrl: charge.invoiceUrl,
    },
  });

  return NextResponse.json({
    aulaId: aula.id,
    paymentUrl: charge.invoiceUrl,
    chargeId: charge.id,
  });
  } catch (error) {
    console.error("Erro ao criar aula/cobrança:", error);
    const message = error instanceof Error ? error.message : "Erro ao processar pagamento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/aulas — lista aulas do usuário logado
export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isPersonal = session.tipo === "personal" || session.tipo === "ambos";
  const isAluno = session.tipo === "aluno" || session.tipo === "ambos";

  if (isPersonal && !isAluno) {
    // Retorna aulas como personal
    const aulas = await prisma.aula.findMany({
      where: { personalId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        aluno: {
          select: { id: true, nome: true, sobrenome: true, avatarUrl: true, telefone: true, isWhatsapp: true, email: true },
        },
      },
    });
    return NextResponse.json(aulas);
  }

  // Retorna aulas como aluno
  const aulas = await prisma.aula.findMany({
    where: { alunoId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      personal: {
        select: { id: true, nome: true, sobrenome: true, avatarUrl: true, telefone: true, isWhatsapp: true, email: true },
      },
    },
  });
  return NextResponse.json(aulas);
}
