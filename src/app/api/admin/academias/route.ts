import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const busca = req.nextUrl.searchParams.get("busca") || undefined;
  const redeId = req.nextUrl.searchParams.get("redeId") || undefined;

  const where: Record<string, unknown> = {};
  if (redeId) where.redeId = redeId;
  if (busca) {
    where.OR = [
      { nome: { contains: busca, mode: "insensitive" } },
      { endereco: { contains: busca, mode: "insensitive" } },
    ];
  }

  const academias = await prisma.academia.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { rede: { select: { id: true, nome: true } } },
  });

  return NextResponse.json(academias);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { nome, endereco, redeId, latitude, longitude } = await req.json();

  if (!nome || !endereco) {
    return NextResponse.json({ error: "Preencha nome e endereço" }, { status: 400 });
  }

  const academia = await prisma.academia.create({
    data: {
      nome,
      endereco,
      redeId: redeId || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    },
    include: { rede: { select: { id: true, nome: true } } },
  });

  return NextResponse.json(academia);
}
