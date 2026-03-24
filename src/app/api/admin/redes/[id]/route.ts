import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { nome } = await req.json();
  const rede = await prisma.rede.update({
    where: { id: params.id },
    data: { nome },
  });

  return NextResponse.json(rede);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  // Remove a associação das academias antes de deletar a rede
  await prisma.academia.updateMany({
    where: { redeId: params.id },
    data: { redeId: null },
  });

  await prisma.rede.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
