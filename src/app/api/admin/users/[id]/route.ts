import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      advertencias: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const body = await req.json();

  // Campos que o admin pode atualizar
  const allowedFields = [
    "nome", "sobrenome", "email", "telefone", "cpf", "dataNascimento",
    "sexo", "cep", "cidade", "bairro", "status", "tipo",
    "cref", "validadeCref", "formacao", "rg",
    "disponivelEmCasa", "valorAproximado", "tipoChavePix", "chavePix",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
