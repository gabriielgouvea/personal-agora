import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  // Buscar dados completos do banco
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    userId: user.id,
    tipo: user.tipo,
    nome: user.nome,
    sobrenome: user.sobrenome,
    email: user.email,
    telefone: user.telefone,
    isWhatsapp: user.isWhatsapp,
    isTelefone: user.isTelefone,
    dataNascimento: user.dataNascimento,
    sexo: user.sexo,
    cpf: user.cpf,
    cep: user.cep,
    rua: user.rua,
    bairro: user.bairro,
    cidade: user.cidade,
    estado: user.estado,
    numero: user.numero,
    complemento: user.complemento,
    avatarUrl: user.avatarUrl || null,
    disponibilidade: user.disponibilidade || null,
    modalidades: user.modalidades || null,
    regioes: user.regioes || null,
    academias: user.academias || null,
    plano: user.plano || null,
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  const body = await request.json();

  // Campos permitidos para atualização
  const allowed: Record<string, unknown> = {};
  const fields = [
    "nome", "sobrenome", "email", "telefone",
    "isWhatsapp", "isTelefone", "dataNascimento", "sexo",
    "cep", "rua", "bairro", "cidade", "estado",
    "numero", "complemento", "avatarUrl", "disponibilidade",
    "academias",
  ];
  for (const f of fields) {
    if (body[f] !== undefined) allowed[f] = body[f];
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: allowed,
  });

  // Atualizar a sessão JWT com os novos dados
  await createSession({
    userId: user.id,
    tipo: user.tipo,
    nome: user.nome,
    sobrenome: user.sobrenome,
    email: user.email,
    avatarUrl: user.avatarUrl || undefined,
  });

  return NextResponse.json({ success: true });
}
