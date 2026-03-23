import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { status } = await req.json();
  if (!["ativo", "rejeitado", "suspenso"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(user);
}
