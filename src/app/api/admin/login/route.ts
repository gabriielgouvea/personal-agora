import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const valid = await verifyPassword(senha, admin.senha);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    await createAdminSession({
      adminId: admin.id,
      nome: admin.nome,
      email: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Erro login admin:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
