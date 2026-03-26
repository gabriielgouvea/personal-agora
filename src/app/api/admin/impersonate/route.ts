import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "personal-agora-secret-key-change-in-prod"
);

// POST /api/admin/impersonate
// Body: { userId: string, tipoVisao: "aluno" | "personal" }
// Returns: { token: string }
export async function POST(req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) return NextResponse.json(null, { status: 401 });

  const { userId, tipoVisao } = await req.json();
  if (!userId || !tipoVisao) {
    return NextResponse.json({ error: "userId e tipoVisao são obrigatórios" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, tipo: true, nome: true, sobrenome: true, email: true, avatarUrl: true },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const token = await new SignJWT({
    userId: user.id,
    tipoVisao,
    nome: user.nome,
    sobrenome: user.sobrenome,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
    impersonate: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(SECRET);

  return NextResponse.json({ token });
}
