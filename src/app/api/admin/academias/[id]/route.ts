import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { nome, endereco } = await req.json();
  const data: Record<string, string> = {};
  if (nome !== undefined) data.nome = nome;
  if (endereco !== undefined) data.endereco = endereco;

  const academia = await prisma.academia.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(academia);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  await prisma.academia.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
