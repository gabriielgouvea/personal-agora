import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

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
  cref: z.string().min(4),
  validadeCref: z.string().min(7),
  formacao: z.string().min(1),
  rg: z.string().min(5),
  academias: z.array(z.string()),
  modalidades: z.array(z.string()),
  regioes: z.array(z.string()),
  preferenciaGeneroAluno: z.string().min(1),
  disponivelEmCasa: z.boolean(),
  valorAproximado: z.string().min(1),
  tipoChavePix: z.string().min(1),
  chavePix: z.string().min(3),
  plano: z.string().min(1),
  codigoConvite: z.string().optional(),
  codigoCupom: z.string().optional(),
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

    // Verificar duplicatas
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
          message: `Esse ${label} já está cadastrado em nossa plataforma.`,
        },
        { status: 409 }
      );
    }

    // Processar convite
    let plano: string | null = data.plano || null;
    let planoAtivo = false;
    let planoInicio: Date | null = null;
    let planoFim: Date | null = null;
    let conviteUsado: string | null = null;

    if (data.codigoConvite) {
      const cpfLimpo = data.cpf.replace(/\D/g, "");
      const convite = await prisma.convite.findFirst({
        where: { cpf: cpfLimpo, usado: false },
      });
      if (convite) {
          plano = "pro";
          planoAtivo = true;
          planoInicio = new Date();
          planoFim = new Date();
          planoFim.setMonth(planoFim.getMonth() + 2);
          conviteUsado = convite.id;
      }
    }

    // Processar cupom (incrementar usos)
    if (data.codigoCupom) {
      const cupom = await prisma.cupom.findUnique({
        where: { codigo: data.codigoCupom },
      });
      if (cupom && cupom.ativo && cupom.usosAtuais < cupom.limiteUsos) {
        await prisma.cupom.update({
          where: { id: cupom.id },
          data: { usosAtuais: { increment: 1 } },
        });
      }
    }

    const hashedPassword = await hashPassword(data.senha);

    const user = await prisma.user.create({
      data: {
        tipo: "personal",
        status: "pendente",
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
        cref: data.cref,
        validadeCref: data.validadeCref,
        formacao: data.formacao,
        rg: data.rg,
        academias: JSON.stringify(data.academias),
        modalidades: JSON.stringify(data.modalidades),
        regioes: JSON.stringify(data.regioes),
        preferenciaGeneroAluno: data.preferenciaGeneroAluno,
        disponivelEmCasa: data.disponivelEmCasa,
        valorAproximado: data.valorAproximado,
        tipoChavePix: data.tipoChavePix,
        chavePix: data.chavePix,
        plano,
        planoAtivo,
        planoInicio,
        planoFim,
        conviteUsado,
      },
    });

    // Marcar convite como usado
    if (conviteUsado) {
      await prisma.convite.update({
        where: { id: conviteUsado },
        data: { usado: true, usadoPor: user.id },
      });
    }

    return NextResponse.json({ success: true, id: user.id });
  } catch (error: unknown) {
    console.error(error);
    const err = error as { code?: string; message?: string };

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Dados duplicados. Verifique e-mail, CPF ou telefone." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Erro ao salvar o cadastro: ${err.message}` },
      { status: 500 }
    );
  }
}
