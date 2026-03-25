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

  // Gerar código único
  const codigo = `INV-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  const convite = await prisma.convite.create({
    data: {
      codigo,
      cpf: cpf.replace(/\D/g, ""),
    },
  });

  return NextResponse.json(convite, { status: 201 });
}
