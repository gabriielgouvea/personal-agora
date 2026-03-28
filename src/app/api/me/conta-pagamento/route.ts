import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — retorna dados de conta/PIX do personal
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      tipo: true,
      tipoChavePix: true,
      chavePix: true,
      banco: true,
      agencia: true,
      contaBancaria: true,
      tipoConta: true,
    },
  });

  if (!user || (user.tipo !== "personal" && user.tipo !== "ambos")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  return NextResponse.json({
    tipoChavePix: user.tipoChavePix,
    chavePix: user.chavePix,
    banco: user.banco,
    agencia: user.agencia,
    contaBancaria: user.contaBancaria,
    tipoConta: user.tipoConta,
  });
}

// PATCH — atualiza dados de conta/PIX do personal
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { tipo: true },
  });

  if (!user || (user.tipo !== "personal" && user.tipo !== "ambos")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { tipoChavePix, chavePix, banco, agencia, contaBancaria, tipoConta } = body;

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      tipoChavePix: tipoChavePix ?? undefined,
      chavePix: chavePix ?? undefined,
      banco: banco ?? undefined,
      agencia: agencia ?? undefined,
      contaBancaria: contaBancaria ?? undefined,
      tipoConta: tipoConta ?? undefined,
    },
    select: {
      tipoChavePix: true,
      chavePix: true,
      banco: true,
      agencia: true,
      contaBancaria: true,
      tipoConta: true,
    },
  });

  return NextResponse.json(updated);
}
