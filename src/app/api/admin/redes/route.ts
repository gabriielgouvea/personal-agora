import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const redes = await prisma.rede.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { academias: true } } },
  });

  return NextResponse.json(redes);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { nome } = await req.json();

  if (!nome) {
    return NextResponse.json({ error: "Preencha o nome da rede" }, { status: 400 });
  }

  const exists = await prisma.rede.findUnique({ where: { nome } });
  if (exists) {
    return NextResponse.json({ error: "Essa rede já existe" }, { status: 409 });
  }

  const rede = await prisma.rede.create({ data: { nome } });
  return NextResponse.json(rede);
}
