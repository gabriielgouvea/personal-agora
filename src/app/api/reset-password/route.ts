import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { token, novaSenha } = await req.json();

  if (!token || !novaSenha) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (typeof novaSenha !== "string" || novaSenha.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const hashedToken = createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Link inválido ou expirado. Solicite um novo link." },
      { status: 400 }
    );
  }

  const senhaHash = await hashPassword(novaSenha);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      senha: senhaHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ message: "Senha redefinida com sucesso." });
}
