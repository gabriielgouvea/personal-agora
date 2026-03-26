import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createSession } from "@/lib/auth";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "personal-agora-secret-key-change-in-prod"
);

// POST /api/admin/impersonate/validate
// Body: { token: string }
// Sets pa_session cookie and returns { tipo }
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token obrigatório" }, { status: 400 });

  try {
    const { payload } = await jwtVerify(token, SECRET);

    if (!payload.impersonate) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    const tipoVisao = payload.tipoVisao as string;

    await createSession({
      userId: payload.userId as string,
      tipo: tipoVisao,
      nome: payload.nome as string,
      sobrenome: payload.sobrenome as string,
      email: payload.email as string,
      avatarUrl: (payload.avatarUrl as string) || undefined,
    });

    return NextResponse.json({ success: true, tipo: tipoVisao });
  } catch {
    return NextResponse.json({ error: "Token expirado ou inválido" }, { status: 401 });
  }
}
