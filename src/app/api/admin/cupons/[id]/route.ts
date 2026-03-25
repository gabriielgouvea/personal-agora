import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

// Atualizar cupom (ativar/desativar)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const body = await req.json();
  const cupom = await prisma.cupom.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(cupom);
}

// Deletar cupom
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  await prisma.cupom.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
