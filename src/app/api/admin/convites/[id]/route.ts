import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

// Deletar convite
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  await prisma.convite.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
