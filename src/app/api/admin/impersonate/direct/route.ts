import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { SESSION_SECRET, SESSION_COOKIE_NAME } from "@/lib/auth";

// GET /api/admin/impersonate/direct?userId=...&tipo=aluno|personal
// Verifica sessão admin, cria sessão de usuário e redireciona ao dashboard
export async function GET(req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.redirect(new URL("/painel/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const tipo = searchParams.get("tipo") as "aluno" | "personal" | null;

  if (!userId || !tipo || !["aluno", "personal"].includes(tipo)) {
    return new NextResponse("Parâmetros inválidos", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nome: true, sobrenome: true, email: true, avatarUrl: true },
  });

  if (!user) {
    return new NextResponse("Usuário não encontrado", { status: 404 });
  }

  const token = await new SignJWT({
    userId: user.id,
    tipo,
    nome: user.nome,
    sobrenome: user.sobrenome,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(SESSION_SECRET);

  const dest = tipo === "personal" ? "/dashboard/personal" : "/dashboard/aluno";
  const response = NextResponse.redirect(new URL(dest, req.url));

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 horas
    path: "/",
  });

  return response;
}
