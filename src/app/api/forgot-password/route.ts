import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 pedidos por IP a cada 15 minutos
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`forgot:${ip}`, { limit: 5, windowSeconds: 900 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 }
    );
  }

  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Resposta genérica para não vazar informação sobre quais e-mails existem
  if (!user) {
    return NextResponse.json({
      message: "Se o e-mail estiver cadastrado, você receberá um link de redefinição.",
    });
  }

  // Gerar token seguro
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: expiry,
    },
  });

  try {
    await sendPasswordResetEmail(user.email, user.nome, rawToken);
  } catch (err) {
    console.error("Erro ao enviar e-mail de redefinição:", err);
    return NextResponse.json(
      { error: "Erro ao enviar e-mail. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Se o e-mail estiver cadastrado, você receberá um link de redefinição.",
  });
}
