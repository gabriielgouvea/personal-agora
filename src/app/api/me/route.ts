import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    userId: session.userId,
    tipo: session.tipo,
    nome: session.nome,
    sobrenome: session.sobrenome,
    email: session.email,
    avatarUrl: session.avatarUrl || null,
  });
}
