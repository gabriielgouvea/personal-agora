import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const url = req.nextUrl.searchParams;
  const tipo = url.get("tipo") || undefined;
  const status = url.get("status") || undefined;
  const sexo = url.get("sexo") || undefined;
  const busca = url.get("busca") || undefined;
  const page = parseInt(url.get("page") || "1");
  const limit = parseInt(url.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (tipo) {
    // "personal" deve incluir quem também tem perfil de aluno (tipo=ambos)
    where.tipo = tipo === "personal" ? { in: ["personal", "ambos"] } : tipo;
  }
  if (status) where.status = status;
  if (sexo) where.sexo = sexo;
  if (busca) {
    where.OR = [
      { nome: { contains: busca, mode: "insensitive" } },
      { sobrenome: { contains: busca, mode: "insensitive" } },
      { email: { contains: busca, mode: "insensitive" } },
      { cpf: { contains: busca } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        tipo: true,
        nome: true,
        sobrenome: true,
        email: true,
        telefone: true,
        cpf: true,
        sexo: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
