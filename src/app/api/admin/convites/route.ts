import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

// Listar convites
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const convites = await prisma.convite.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(convites);
}

// Criar convite
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { cpf } = await req.json();

  if (!cpf) {
    return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 });
  }

  const cpfLimpo = cpf.replace(/\D/g, "");

  // Verificar se já existe convite para esse CPF
  const existing = await prisma.convite.findFirst({
    where: { cpf: cpfLimpo, usado: false },
  });
  if (existing) {
    return NextResponse.json({ error: "Já existe um convite ativo para esse CPF" }, { status: 409 });
  }

  const convite = await prisma.convite.create({
    data: {
      codigo: cpfLimpo,
      cpf: cpfLimpo,
    },
  });

  return NextResponse.json(convite, { status: 201 });
}
