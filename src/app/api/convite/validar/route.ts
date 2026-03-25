import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { cpf } = await req.json();

  if (!cpf) {
    return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 });
  }

  const cpfLimpo = cpf.replace(/\D/g, "");

  const convite = await prisma.convite.findFirst({
    where: { cpf: cpfLimpo, usado: false },
  });

  if (!convite) {
    return NextResponse.json({ error: "Nenhum convite encontrado para esse CPF" }, { status: 404 });
  }

  return NextResponse.json({
    valido: true,
    conviteId: convite.id,
    beneficio: "2 meses grátis no plano Pro",
  });
}
