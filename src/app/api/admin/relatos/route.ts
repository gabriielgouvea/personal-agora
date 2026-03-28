import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getAdmin() {
  const token = cookies().get("pa_admin_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { adminId: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "";
  const categoria = searchParams.get("categoria") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status;
  if (categoria) where.categoria = categoria;

  const relatos = await prisma.relato.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      autor: { select: { id: true, nome: true, sobrenome: true, email: true, tipo: true, avatarUrl: true } },
      relatado: { select: { id: true, nome: true, sobrenome: true, email: true, tipo: true, avatarUrl: true } },
      aula: { select: { id: true, valor: true, status: true, createdAt: true } },
    },
    take: 200,
  });

  return NextResponse.json(relatos);
}
