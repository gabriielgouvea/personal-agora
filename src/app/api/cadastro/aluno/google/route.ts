import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({
  googleId: z.string().min(1),
  email: z.string().email(),
  nome: z.string().min(2),
  sobrenome: z.string().min(2),
  avatarUrl: z.string().optional(),
  telefone: z.string().min(14),
  isWhatsapp: z.boolean(),
  isTelefone: z.boolean(),
  dataNascimento: z.string().min(10),
  sexo: z.string().min(1),
  cpf: z.string().min(14),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.formErrors.fieldErrors }, { status: 400 });
    }

    const data = result.data;

    // Checar duplicatas
    const existing = await prisma.user.findFirst({
      where: { OR: [{ cpf: data.cpf }, { telefone: data.telefone }] },
      select: { cpf: true, telefone: true },
    });

    if (existing) {
      const field = existing.cpf === data.cpf ? "cpf" : "telefone";
      const label = field === "cpf" ? "CPF" : "número de telefone";
      return NextResponse.json(
        { error: "duplicate", field, message: `Esse ${label} já está cadastrado.` },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        tipo: "aluno",
        status: "ativo",
        nome: data.nome,
        sobrenome: data.sobrenome,
        email: data.email,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl || null,
        avatarGoogleUrl: data.avatarUrl || null,
        telefone: data.telefone,
        isWhatsapp: data.isWhatsapp,
        isTelefone: data.isTelefone,
        dataNascimento: data.dataNascimento,
        sexo: data.sexo,
        cpf: data.cpf,
      },
    });

    await createSession({
      userId: user.id,
      tipo: user.tipo,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
      avatarUrl: user.avatarUrl || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
