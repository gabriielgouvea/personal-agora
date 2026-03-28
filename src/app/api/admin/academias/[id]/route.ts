import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { nome, endereco, redeId, latitude, longitude } = await req.json();
  const data: Record<string, unknown> = {};
  if (nome !== undefined) data.nome = nome;
  if (endereco !== undefined) data.endereco = endereco;
  if (redeId !== undefined) data.redeId = redeId || null;
  if (latitude !== undefined) data.latitude = latitude ?? null;
  if (longitude !== undefined) data.longitude = longitude ?? null;

  const academia = await prisma.academia.update({
    where: { id: params.id },
    data,
    include: { rede: { select: { id: true, nome: true } } },
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
