import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const CATEGORIAS_VALIDAS = [
  "nao_compareceu",
  "assedio",
  "comportamento_inadequado",
  "atraso_excessivo",
  "cobranca_indevida",
  "qualidade_servico",
  "discriminacao",
  "outro",
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { aulaId, relatadoId, categoria, descricao } = body;

  if (!relatadoId || !categoria || !descricao?.trim()) {
    return NextResponse.json({ error: "Campos obrigatórios: relatadoId, categoria, descricao" }, { status: 400 });
  }

  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  }

  if (descricao.trim().length < 10) {
    return NextResponse.json({ error: "A descrição deve ter no mínimo 10 caracteres" }, { status: 400 });
  }

  if (relatadoId === session.userId) {
    return NextResponse.json({ error: "Você não pode relatar a si mesmo" }, { status: 400 });
  }

  // Se aulaId fornecido, verifica que o usuário faz parte da aula
  if (aulaId) {
    const aula = await prisma.aula.findFirst({
      where: {
        id: aulaId,
        OR: [{ alunoId: session.userId }, { personalId: session.userId }],
      },
    });
    if (!aula) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
    }
  }

  // Verifica se já existe relato do mesmo autor para a mesma aula+categoria
  if (aulaId) {
    const existente = await prisma.relato.findFirst({
      where: { aulaId, autorId: session.userId, categoria },
    });
    if (existente) {
      return NextResponse.json({ error: "Você já fez um relato desta categoria para esta aula" }, { status: 409 });
    }
  }

  const relato = await prisma.relato.create({
    data: {
      aulaId: aulaId || null,
      autorId: session.userId,
      relatadoId,
      categoria,
      descricao: descricao.trim(),
    },
  });

  return NextResponse.json(relato, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const relatos = await prisma.relato.findMany({
    where: { autorId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      relatado: { select: { nome: true, sobrenome: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(relatos);
}
