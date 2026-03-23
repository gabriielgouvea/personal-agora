import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Preencha todos os campos." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(senha, user.senha);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      tipo: user.tipo,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
      avatarUrl: user.avatarUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      tipo: user.tipo,
    });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error("Erro no login:", err);

    if (err.code === "P2021" || /does not exist|relation.*does not exist/i.test(String(err.message))) {
      return NextResponse.json(
        { error: "Sistema em manutenção. Tente novamente em alguns minutos." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
