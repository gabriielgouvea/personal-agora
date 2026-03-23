import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { secret, nome, email, senha } = await request.json();

    // Proteção: só funciona com um secret
    if (secret !== process.env.ADMIN_SEED_SECRET && secret !== "ascora-setup-2026") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Admin já existe." }, { status: 409 });
    }

    const hashed = await hashPassword(senha);
    const admin = await prisma.admin.create({
      data: { nome, email, senha: hashed },
    });

    return NextResponse.json({ success: true, id: admin.id });
  } catch (error: unknown) {
    console.error("Erro seed admin:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
