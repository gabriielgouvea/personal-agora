import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas (admin link dura mais)

  await prisma.user.update({
    where: { id: params.id },
    data: { resetToken: hashedToken, resetTokenExpiry: expiry },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://personal-agora.vercel.app";
  const link = `${baseUrl}/login/redefinir-senha?token=${rawToken}`;

  return NextResponse.json({ link, email: user.email, nome: user.nome, telefone: user.telefone });
}
