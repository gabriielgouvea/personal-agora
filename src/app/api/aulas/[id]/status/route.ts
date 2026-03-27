import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/asaas";

// GET /api/aulas/[id]/status — retorna status atual do pagamento
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const aula = await prisma.aula.findUnique({
    where: { id: params.id },
    select: { alunoId: true, asaasChargeId: true, status: true },
  });

  if (!aula) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  if (aula.alunoId !== session.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // Se já está paga/confirmada no banco, retorna direto
  if (aula.status !== "aguardando_pagamento") {
    return NextResponse.json({ status: aula.status });
  }

  // Senão, consulta o Asaas para ter o status mais recente
  if (aula.asaasChargeId) {
    try {
      const asaas = await getPaymentStatus(aula.asaasChargeId);
      // Se Asaas confirma pagamento, atualiza o banco
      if (asaas.status === "RECEIVED" || asaas.status === "CONFIRMED") {
        await prisma.aula.update({
          where: { id: params.id },
          data: { status: "paga" },
        });
        return NextResponse.json({ status: "paga" });
      }
    } catch (error) {
      console.error("Erro ao consultar status Asaas:", error);
    }
  }

  return NextResponse.json({ status: aula.status });
}
