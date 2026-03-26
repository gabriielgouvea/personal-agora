import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Endpoint público — usado no formulário de cadastro de personal
export async function GET(req: NextRequest) {
  const busca = req.nextUrl.searchParams.get("busca") || "";

  const where = busca
    ? { nome: { contains: busca, mode: "insensitive" as const } }
    : {};

  const academias = await prisma.academia.findMany({
    where,
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, endereco: true },
    take: 50,
  });

  return NextResponse.json(academias);
}
