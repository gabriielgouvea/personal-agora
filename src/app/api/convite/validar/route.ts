import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { codigo, cpf } = await req.json();

  if (!codigo || !cpf) {
    return NextResponse.json({ error: "Código e CPF são obrigatórios" }, { status: 400 });
  }

  const convite = await prisma.convite.findUnique({ where: { codigo } });

  if (!convite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  if (convite.usado) {
    return NextResponse.json({ error: "Este convite já foi utilizado" }, { status: 400 });
  }

  // Compara CPF removendo formatação
  const cpfLimpo = cpf.replace(/\D/g, "");
  const conviteCpfLimpo = convite.cpf.replace(/\D/g, "");

  if (cpfLimpo !== conviteCpfLimpo) {
    return NextResponse.json({ error: "Este convite não pertence a esse CPF" }, { status: 403 });
  }

  return NextResponse.json({
    valido: true,
    codigo: convite.codigo,
    beneficio: "2 meses grátis no plano Pro",
  });
}
