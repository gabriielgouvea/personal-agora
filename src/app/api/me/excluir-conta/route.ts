import { NextRequest, NextResponse } from "next/server";
import { getSession, destroySession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cancelAsaasSubscription } from "@/lib/asaas";

const MOTIVOS_VALIDOS = [
  "Não estou mais usando a plataforma",
  "Encontrei outro serviço",
  "Problemas com a plataforma",
  "Questões de privacidade",
  "Problemas com pagamento",
  "Outro motivo",
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { motivo } = body;

  if (!motivo || !MOTIVOS_VALIDOS.includes(motivo)) {
    return NextResponse.json({ error: "Selecione um motivo válido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      tipo: true,
      status: true,
      planoAtivo: true,
      planoFim: true,
      asaasSubscriptionId: true,
      cancelamentoPedidoEm: true,
      contaExcluirEm: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  if (user.status === "excluido") return NextResponse.json({ error: "Conta já excluída" }, { status: 409 });
  if (user.contaExcluirEm) return NextResponse.json({ error: "Exclusão já agendada" }, { status: 409 });

  const isPersonal = user.tipo === "personal" || user.tipo === "ambos";
  const temPlanoAtivo = isPersonal && user.planoAtivo && user.planoFim && new Date(user.planoFim) > new Date();

  if (isPersonal && temPlanoAtivo && user.planoFim) {
    // Personal com assinatura ativa: agendar exclusão para o fim do plano
    // Cancelar no Asaas se ainda não cancelou
    if (user.asaasSubscriptionId && !user.cancelamentoPedidoEm) {
      try {
        await cancelAsaasSubscription(user.asaasSubscriptionId);
      } catch (err) {
        console.error("Erro ao cancelar Asaas na exclusão de conta:", err);
        // Não bloqueia — registra exclusão de qualquer forma
      }
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        excluirContaMotivo: motivo,
        contaExcluirEm: user.planoFim,
        // Registra cancelamento de assinatura se ainda não havia
        cancelamentoPedidoEm: user.cancelamentoPedidoEm ?? new Date(),
        cancelamentoMotivo: user.cancelamentoPedidoEm ? undefined : `[Exclusão de conta] ${motivo}`,
      },
    });

    return NextResponse.json({
      agendado: true,
      excluirEm: user.planoFim.toISOString(),
    });
  }

  // Aluno ou personal sem plano ativo: exclusão imediata (soft-delete)
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      status: "excluido",
      excluirContaMotivo: motivo,
      contaExcluirEm: new Date(),
    },
  });

  // Encerra a sessão
  await destroySession();

  return NextResponse.json({ excluido: true });
}
