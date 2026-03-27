import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateAsaasSubscriptionValue } from "@/lib/asaas";
import {
  sendAulaConfirmadaAluno,
  sendAulaConfirmadaPersonal,
  sendAulaConfirmadaAdmin,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // Verificar token de segurança do Asaas (configurado no painel → Integrações → Webhooks)
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (!webhookToken) {
      console.error("ASAAS_WEBHOOK_TOKEN não configurado");
      return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });
    }

    const receivedToken = req.headers.get("asaas-access-token");
    if (receivedToken !== webhookToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      const externalReference: string | null = payment.externalReference ?? null;

      // ── Aula avulsa ──
      if (externalReference && !subscriptionId) {
        const aula = await prisma.aula.findUnique({
          where: { id: externalReference },
          include: {
            aluno: { select: { id: true, nome: true, sobrenome: true, email: true } },
            personal: { select: { id: true, nome: true, sobrenome: true, email: true } },
          },
        });

        if (aula && aula.status === "aguardando_pagamento") {
          await prisma.aula.update({
            where: { id: aula.id },
            data: { status: "paga" },
          });

          // Enviar emails paralelamente (erros silenciosos para não rejeitar o webhook)
          Promise.all([
            sendAulaConfirmadaAluno(
              aula.aluno.email,
              aula.aluno.nome,
              aula.personal.nome,
              aula.valor,
              aula.id,
            ),
            sendAulaConfirmadaPersonal(
              aula.personal.email,
              aula.personal.nome,
              `${aula.aluno.nome} ${aula.aluno.sobrenome}`,
              aula.valor,
              aula.id,
            ),
            sendAulaConfirmadaAdmin(
              `${aula.aluno.nome} ${aula.aluno.sobrenome}`,
              aula.personal.nome,
              aula.personal.email,
              aula.valor,
              aula.id,
            ),
          ]).catch((e) => console.error("Email error:", e));
        }
      }

      // ── Assinatura de plano ──
      if (subscriptionId) {
        const user = await prisma.user.findFirst({
          where: { asaasSubscriptionId: subscriptionId },
          select: { id: true, plano: true, cupomMesesRestantes: true, valorPlanoOriginal: true },
        });

        if (user) {
          const agora = new Date();
          const fim = new Date(agora);
          fim.setMonth(fim.getMonth() + 1);

          const updateData: Record<string, unknown> = {
            planoAtivo: true,
            planoInicio: agora,
            planoFim: fim,
          };

          // Decrementar meses de desconto restantes do cupom
          if (user.cupomMesesRestantes > 0) {
            const restantes = user.cupomMesesRestantes - 1;
            updateData.cupomMesesRestantes = restantes;

            // Se acabaram os meses de desconto, restaurar valor original da assinatura
            if (restantes === 0 && user.valorPlanoOriginal) {
              try {
                await updateAsaasSubscriptionValue(subscriptionId, user.valorPlanoOriginal);
                updateData.valorPlanoOriginal = null;
              } catch (e) {
                console.error("Erro ao restaurar valor da assinatura:", e);
              }
            }
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
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
