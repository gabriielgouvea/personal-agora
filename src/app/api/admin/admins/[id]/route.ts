import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  // Não pode deletar a si próprio
  if (session.adminId === params.id) {
    return NextResponse.json(
      { error: "Você não pode remover sua própria conta" },
      { status: 400 }
    );
  }

  await prisma.admin.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
