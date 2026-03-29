import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { refundAsaasPayment } from "@/lib/asaas";

const LIMITE_HORAS_CANCELAMENTO = 12;
const MAX_ADVERTENCIAS_30_DIAS = 3;

// PATCH /api/aulas/[id]/cancelar — cancela uma aula
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { motivo } = body as { motivo?: string };

  const aula = await prisma.aula.findUnique({
    where: { id: params.id },
    include: {
      aluno: { select: { id: true, nome: true, sobrenome: true, email: true } },
      personal: { select: { id: true, nome: true, sobrenome: true, email: true } },
    },
  });

  if (!aula) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });

  // Apenas participantes podem cancelar
  const isAluno = aula.alunoId === session.userId;
  const isPersonal = aula.personalId === session.userId;
  if (!isAluno && !isPersonal) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // Só pode cancelar aulas com status "paga", "aguardando_pagamento" ou "aceita"
  if (!["paga", "aguardando_pagamento", "aceita"].includes(aula.status)) {
    return NextResponse.json(
      { error: "Esta aula não pode ser cancelada no status atual" },
      { status: 400 }
    );
  }

  const agora = new Date();
  const canceladoPor = isAluno ? "aluno" : "personal";

  // Verificar se é cancelamento tardio (menos de 12h para a aula agendada)
  let cancelamentoTardio = false;
  if (aula.scheduledAt) {
    const horasRestantes = (aula.scheduledAt.getTime() - agora.getTime()) / (1000 * 60 * 60);
    cancelamentoTardio = horasRestantes < LIMITE_HORAS_CANCELAMENTO;
  }

  // ── Regras para ALUNO ──
  if (isAluno) {
    if (["paga", "aceita"].includes(aula.status) && cancelamentoTardio) {
      // Cancelamento tardio do aluno: aula é considerada como dada, sem reembolso
      await prisma.aula.update({
        where: { id: params.id },
        data: {
          status: "confirmada",
          confirmedAt: agora,
          releasedAt: agora,
          canceladoPor,
          canceladoEm: agora,
          motivoCancelamento: motivo || "Cancelamento tardio pelo aluno (< 12h) — aula considerada realizada",
          cancelamentoTardio: true,
        },
      });

      return NextResponse.json({
        ok: true,
        status: "confirmada",
        tardio: true,
        mensagem:
          "Como o cancelamento foi feito com menos de 12 horas de antecedência, a aula é considerada como realizada e o valor será repassado ao personal.",
      });
    }

    // Cancelamento dentro do prazo: cancela e reembolsa
    const statusPago = ["paga", "aceita"].includes(aula.status);
    await prisma.aula.update({
      where: { id: params.id },
      data: {
        status: statusPago ? "reembolsada" : "cancelada",
        canceladoPor,
        canceladoEm: agora,
        motivoCancelamento: motivo || "Cancelamento pelo aluno",
        cancelamentoTardio: false,
      },
    });

    // Reembolso automático via Asaas
    if (statusPago && aula.asaasChargeId) {
      try {
        await refundAsaasPayment(
          aula.asaasChargeId,
          undefined,
          `Cancelamento pelo aluno — aula ${aula.id}`,
        );
      } catch (e) {
        console.error("Erro ao processar reembolso Asaas (aluno):", e);
      }
    }

    // Notificar aluno sobre o reembolso
    if (statusPago) {
      try {
        const { sendStatusAlteradoAluno } = await import("@/lib/email");
        await sendStatusAlteradoAluno(
          aula.aluno.email,
          aula.aluno.nome,
          `${aula.personal.nome} ${aula.personal.sobrenome}`,
          "reembolsada",
          aula.id,
        );
      } catch (e) {
        console.error("Erro ao notificar aluno sobre reembolso:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      status: statusPago ? "reembolsada" : "cancelada",
      tardio: false,
      mensagem: statusPago
        ? "Aula cancelada com sucesso. O reembolso será processado automaticamente."
        : "Aula cancelada com sucesso.",
    });
  }

  // ── Regras para PERSONAL ──
  if (isPersonal) {
    // Cancelamento do personal: sempre reembolsa o aluno
    const statusPago = ["paga", "aceita"].includes(aula.status);
    await prisma.aula.update({
      where: { id: params.id },
      data: {
        status: statusPago ? "reembolsada" : "cancelada",
        canceladoPor,
        canceladoEm: agora,
        motivoCancelamento: motivo || "Cancelamento pelo personal",
        cancelamentoTardio,
      },
    });

    // Reembolso automático via Asaas
    if (statusPago && aula.asaasChargeId) {
      try {
        await refundAsaasPayment(
          aula.asaasChargeId,
          undefined,
          `Cancelamento pelo personal — aula ${aula.id}`,
        );
      } catch (e) {
        console.error("Erro ao processar reembolso Asaas (personal):", e);
      }
    }

    // Se cancelamento tardio, registrar advertência
    if (cancelamentoTardio) {
      await prisma.advertencia.create({
        data: {
          userId: session.userId,
          aulaId: params.id,
          tipo: "cancelamento_tardio",
          descricao: `Cancelamento de aula com menos de ${LIMITE_HORAS_CANCELAMENTO}h de antecedência`,
          pontos: 1,
        },
      });

      // Verificar se atingiu limite de advertências (suspensão automática)
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

      const totalAdvertencias = await prisma.advertencia.count({
        where: {
          userId: session.userId,
          createdAt: { gte: trintaDiasAtras },
        },
      });

      if (totalAdvertencias >= MAX_ADVERTENCIAS_30_DIAS) {
        await prisma.user.update({
          where: { id: session.userId },
          data: { status: "suspenso" },
        });

        // Notificar admin sobre suspensão
        try {
          const { sendAulaConfirmadaAdmin } = await import("@/lib/email");
          await sendAulaConfirmadaAdmin(
            `[SUSPENSÃO] ${aula.personal.nome} ${aula.personal.sobrenome}`,
            `Suspenso automaticamente (${totalAdvertencias} advertências em 30 dias)`,
            aula.personal.email,
            0,
            params.id,
          );
        } catch (e) {
          console.error("Erro ao notificar admin sobre suspensão:", e);
        }

        return NextResponse.json({
          ok: true,
          status: "cancelada",
          tardio: true,
          suspenso: true,
          mensagem:
            "Aula cancelada. Você acumulou advertências por cancelamentos em cima da hora e sua conta foi temporariamente suspensa. Entre em contato com o suporte.",
        });
      }

      return NextResponse.json({
        ok: true,
        status: statusPago ? "reembolsada" : "cancelada",
        tardio: true,
        advertencia: true,
        totalAdvertencias,
        mensagem: `Aula cancelada, mas você recebeu uma advertência por cancelar com menos de ${LIMITE_HORAS_CANCELAMENTO}h de antecedência. Você tem ${totalAdvertencias}/${MAX_ADVERTENCIAS_30_DIAS} advertências nos últimos 30 dias. Ao atingir ${MAX_ADVERTENCIAS_30_DIAS}, sua conta será suspensa temporariamente.`,
      });
    }

    // Notificar aluno sobre o cancelamento
    try {
      const { sendStatusAlteradoAluno } = await import("@/lib/email");
      await sendStatusAlteradoAluno(
        aula.aluno.email,
        aula.aluno.nome,
        `${aula.personal.nome} ${aula.personal.sobrenome}`,
        statusPago ? "reembolsada" : "cancelada",
        aula.id,
      );
    } catch (e) {
      console.error("Erro ao notificar aluno sobre cancelamento:", e);
    }

    return NextResponse.json({
      ok: true,
      status: statusPago ? "reembolsada" : "cancelada",
      tardio: false,
      mensagem: statusPago
        ? "Aula cancelada. O reembolso será processado automaticamente."
        : "Aula cancelada com sucesso.",
    });
  }

  return NextResponse.json({ error: "Operação inválida" }, { status: 400 });
}
