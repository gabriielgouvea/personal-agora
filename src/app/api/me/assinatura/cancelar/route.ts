import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cancelAsaasSubscription } from "@/lib/asaas";

const schema = z.object({
  motivo: z.string().min(1, "Selecione um motivo"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.formErrors.fieldErrors.motivo?.[0] ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { asaasSubscriptionId: true, cancelamentoPedidoEm: true, planoFim: true },
  });

  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (user.cancelamentoPedidoEm) {
    return NextResponse.json({ error: "Assinatura já está em processo de cancelamento" }, { status: 409 });
  }

  // Cancelar no Asaas se tiver assinatura
  if (user.asaasSubscriptionId) {
    try {
      await cancelAsaasSubscription(user.asaasSubscriptionId);
    } catch (err) {
      console.error("Erro ao cancelar no Asaas:", err);
      return NextResponse.json({ error: "Erro ao cancelar assinatura. Tente novamente." }, { status: 500 });
    }
  }

  // Registrar cancelamento — acesso fica ativo até planoFim
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      cancelamentoPedidoEm: new Date(),
      cancelamentoMotivo: result.data.motivo,
    },
  });

  return NextResponse.json({ success: true, planoFim: user.planoFim });
}
