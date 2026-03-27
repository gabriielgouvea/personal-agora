import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { campo, valor } = await req.json();

    if (!campo || !valor || !["telefone", "email", "cpf"].includes(campo)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { [campo]: valor },
      select: { id: true },
    });

    return NextResponse.json({ existe: !!existing });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
