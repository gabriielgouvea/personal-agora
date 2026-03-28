import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit: 10 tentativas por IP a cada 15 minutos
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit(`login:${ip}`, { limit: 10, windowSeconds: 900 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429 }
      );
    }

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

    // Usuário cadastrado só pelo Google não tem senha
    if (!user.senha) {
      return NextResponse.json(
        { error: "Esta conta usa login com Google. Clique em \"Entrar com Google\"." },
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

    // Bloquear contas excluídas
    if (user.status === "excluido") {
      return NextResponse.json(
        { error: "Esta conta foi excluída e não pode mais ser acessada." },
        { status: 403 }
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
