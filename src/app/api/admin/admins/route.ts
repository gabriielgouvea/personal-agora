import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession, hashPassword } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const admins = await prisma.admin.findMany({
    select: { id: true, nome: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { nome, email, senha } = await req.json();

  if (!nome || !email || !senha) {
    return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
  }

  const exists = await prisma.admin.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const senhaHash = await hashPassword(senha);
  const admin = await prisma.admin.create({
    data: { nome, email, senha: senhaHash },
  });

  return NextResponse.json({ id: admin.id, nome: admin.nome, email: admin.email });
}
