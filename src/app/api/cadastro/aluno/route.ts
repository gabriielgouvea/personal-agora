import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

const registerSchema = z.object({
  nome: z.string().min(2),
  sobrenome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  telefone: z.string().min(14),
  isWhatsapp: z.boolean(),
  isTelefone: z.boolean(),
  dataNascimento: z.string().min(10),
  sexo: z.string().min(1),
  cpf: z.string().min(14),
  cep: z.string().optional(),
  rua: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  esportes: z.array(z.string()),
  academias: z.array(z.string()),
  temWellhub: z.boolean(),
  temTotalPass: z.boolean(),
  experiencia: z.string(),
  tempoTreino: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.formErrors.fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // ── Verificar duplicatas ──
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { cpf: data.cpf },
          { telefone: data.telefone },
        ],
      },
      select: { email: true, cpf: true, telefone: true },
    });

    if (existing) {
      let field = "email";
      let label = "e-mail";
      if (existing.cpf === data.cpf) {
        field = "cpf";
        label = "CPF";
      } else if (existing.telefone === data.telefone) {
        field = "telefone";
        label = "número de telefone";
      }

      return NextResponse.json(
        {
          error: "duplicate",
          field,
          message: `Ops! 😅 Esse ${label} já está cadastrado em nossa plataforma. Deseja recuperar o acesso dessa conta?`,
        },
        { status: 409 }
      );
    }

    // ── Criar usuário ──
    const hashedPassword = await hashPassword(data.senha);

    const user = await prisma.user.create({
      data: {
        tipo: "aluno",
        nome: data.nome,
        sobrenome: data.sobrenome,
        email: data.email,
        senha: hashedPassword,
        telefone: data.telefone,
        isWhatsapp: data.isWhatsapp,
        isTelefone: data.isTelefone,
        dataNascimento: data.dataNascimento,
        sexo: data.sexo,
        cpf: data.cpf,
        cep: data.cep || null,
        rua: data.rua || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        esportes: JSON.stringify(data.esportes),
        academias: JSON.stringify(data.academias),
        temWellhub: data.temWellhub,
        temTotalPass: data.temTotalPass,
        experiencia: data.experiencia,
        tempoTreino: data.tempoTreino || null,
      },
    });

    // ── Criar sessão ──
    await createSession({
      userId: user.id,
      tipo: "aluno",
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
    });

    return NextResponse.json({ success: true, id: user.id });
  } catch (error: unknown) {
    console.error("Erro no cadastro de aluno:", error);
    const err = error as { code?: string; message?: string };

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "duplicate", field: "unknown", message: "Esse dado já está cadastrado." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Erro ao criar conta: ${err.message || "Erro desconhecido"}` },
      { status: 500 }
    );
  }
}
