import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createOrFindAsaasCustomer, createAsaasCardCharge } from "@/lib/asaas";

// POST /api/aulas/[id]/pagar-cartao — paga aula com cartão de crédito (transparente)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const aula = await prisma.aula.findUnique({
      where: { id: params.id },
      include: {
        aluno: {
          select: {
            id: true, nome: true, sobrenome: true, email: true,
            cpf: true, cep: true, numero: true, telefone: true,
            asaasCustomerId: true,
          },
        },
        personal: {
          select: { id: true, nome: true },
        },
      },
    });

    if (!aula) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
    if (aula.alunoId !== session.userId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    if (aula.status !== "aguardando_pagamento") {
      return NextResponse.json({ error: "Esta aula já foi paga" }, { status: 400 });
    }

    const body = await req.json();
    const { creditCard, installmentCount } = body as {
      creditCard: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
      };
      installmentCount?: number;
    };

    if (!creditCard?.number || !creditCard?.holderName || !creditCard?.expiryMonth ||
        !creditCard?.expiryYear || !creditCard?.ccv) {
      return NextResponse.json({ error: "Dados do cartão incompletos" }, { status: 400 });
    }

    const aluno = aula.aluno;
    if (!aluno.cpf) {
      return NextResponse.json({ error: "CPF não cadastrado. Atualize seu perfil." }, { status: 400 });
    }

    // Criar/encontrar customer Asaas
    let customerId = aluno.asaasCustomerId;
    if (!customerId) {
      customerId = await createOrFindAsaasCustomer(
        aluno.nome, aluno.sobrenome, aluno.email, aluno.cpf
      );
      await prisma.user.update({
        where: { id: aluno.id },
        data: { asaasCustomerId: customerId },
      });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const charge = await createAsaasCardCharge(
      customerId,
      aula.valor,
      dueDateStr,
      `Aula com ${aula.personal.nome} - Personal Agora`,
      aula.id,
      creditCard,
      {
        name: `${aluno.nome} ${aluno.sobrenome}`.trim(),
        email: aluno.email,
        cpfCnpj: aluno.cpf.replace(/\D/g, ""),
        postalCode: (aluno.cep ?? "").replace(/\D/g, ""),
        addressNumber: aluno.numero ?? "0",
        phone: (aluno.telefone ?? "").replace(/\D/g, ""),
      },
      installmentCount,
    );

    // Atualizar aula com dados da cobrança
    const isPaid = charge.status === "CONFIRMED" || charge.status === "RECEIVED";
    await prisma.aula.update({
      where: { id: aula.id },
      data: {
        asaasChargeId: charge.id,
        paymentUrl: charge.invoiceUrl,
        status: isPaid ? "paga" : "aguardando_pagamento",
      },
    });

    return NextResponse.json({
      success: true,
      chargeId: charge.id,
      status: charge.status,
      paid: isPaid,
    });
  } catch (error) {
    console.error("Erro ao processar cartão:", error);
    const message = error instanceof Error ? error.message : "Erro ao processar pagamento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
