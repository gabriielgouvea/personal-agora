import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createOrFindAsaasCustomer, createAsaasSubscription, getSubscriptionPaymentUrl } from "@/lib/asaas";
import { isValidCPF } from "@/lib/utils";

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
  disponibilidade: z.string().min(2),
  tipoChavePix: z.string().min(1),
  chavePix: z.string().min(3),
  plano: z.string().min(1),
  billingType: z.enum(["PIX", "CREDIT_CARD"]).optional(),
  codigoConvite: z.string().optional(),
  codigoCupom: z.string().optional(),
  confirmarCpfDuplicado: z.boolean().optional(),
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
    const confirmarCpfDuplicado = (body as { confirmarCpfDuplicado?: boolean }).confirmarCpfDuplicado === true;

    // Verificar duplicatas
    const existingByCpf = await prisma.user.findUnique({
      where: { cpf: data.cpf },
      select: { id: true, tipo: true, email: true, telefone: true },
    });

    if (existingByCpf) {
      // CPF já tem cadastro de personal - bloquear sempre
      if (existingByCpf.tipo === "personal" || existingByCpf.tipo === "ambos") {
        return NextResponse.json(
          { error: "duplicate", field: "cpf", message: "Esse CPF já está cadastrado como personal trainer." },
          { status: 409 }
        );
      }
      // CPF é aluno mas sem confirmação do usuário
      if (!confirmarCpfDuplicado) {
        return NextResponse.json(
          { error: "duplicate", field: "cpf", message: "Esse CPF já está cadastrado como aluno. Confirme para vincular o perfil de personal." },
          { status: 409 }
        );
      }
      // CPF é aluno e usuário confirmou → vai fazer UPDATE ao final
    } else {
      // CPF não existe: checar email e telefone normalmente
      const existingOther = await prisma.user.findFirst({
        where: { OR: [{ email: data.email }, { telefone: data.telefone }] },
        select: { email: true, telefone: true },
      });
      if (existingOther) {
        const field = existingOther.email === data.email ? "email" : "telefone";
        const label = field === "email" ? "e-mail" : "número de telefone";
        return NextResponse.json(
          { error: "duplicate", field, message: `Esse ${label} já está cadastrado em nossa plataforma.` },
          { status: 409 }
        );
      }
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

    // Processar cupom (calcular desconto e incrementar usos)
    let cupomDesconto: number | undefined;
    if (data.codigoCupom) {
      const cupom = await prisma.cupom.findUnique({
        where: { codigo: data.codigoCupom },
      });
      if (cupom && cupom.ativo && cupom.usosAtuais < cupom.limiteUsos &&
          (!cupom.validade || cupom.validade > new Date())) {
        await prisma.cupom.update({
          where: { id: cupom.id },
          data: { usosAtuais: { increment: 1 } },
        });
        const PLAN_VALUES: Record<string, number> = { start: 29.9, pro: 49.9, elite: 99.9 };
        const baseValue = PLAN_VALUES[plano || "pro"] ?? 49.9;
        if (cupom.tipo === "percentual") {
          cupomDesconto = parseFloat((baseValue * (cupom.valor / 100)).toFixed(2));
        } else {
          cupomDesconto = cupom.valor;
        }
      }
    }

    const hashedPassword = await hashPassword(data.senha);

    const personalFields = {
      tipo: "ambos" as string,
      status: "pendente",
      cref: data.cref,
      validadeCref: data.validadeCref,
      formacao: data.formacao,
      rg: data.rg,
      academias: JSON.stringify(data.academias),
      modalidades: JSON.stringify(data.modalidades),
      regioes: JSON.stringify(data.regioes),
      preferenciaGeneroAluno: data.preferenciaGeneroAluno,
      disponivelEmCasa: data.disponivelEmCasa,
      disponibilidade: data.disponibilidade,
      valorAproximado: data.valorAproximado,
      tipoChavePix: data.tipoChavePix,
      chavePix: data.chavePix,
      plano,
      planoAtivo,
      planoInicio,
      planoFim,
      conviteUsado,
    };

    let user: { id: string };

    if (existingByCpf) {
      // UPDATE do aluno existente: adiciona campos de personal
      user = await prisma.user.update({
        where: { id: existingByCpf.id },
        data: personalFields,
        select: { id: true },
      });
    } else {
      // CREATE novo usuário
      user = await prisma.user.create({
        data: {
          ...personalFields,
          tipo: "personal",
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
        },
        select: { id: true },
      });
    }

    // Marcar convite como usado
    if (conviteUsado) {
      await prisma.convite.update({
        where: { id: conviteUsado },
        data: { usado: true, usadoPor: user.id },
      });
    }

    // Se não tem convite → criar assinatura no Asaas
    let paymentUrl: string | null = null;
    let asaasError: string | null = null;
    if (!planoAtivo) {
      if (!isValidCPF(data.cpf)) {
        asaasError = "CPF inválido — não foi possível gerar o link de pagamento. Acesse o Dashboard → Assinatura para ativar após a aprovação.";
      } else {
        try {
        const customerId = await createOrFindAsaasCustomer(
          data.nome,
          data.sobrenome,
          data.email,
          data.cpf
        );
        const billingType = (body as { billingType?: "PIX" | "CREDIT_CARD" }).billingType ?? "UNDEFINED";
        const subscriptionId = await createAsaasSubscription(customerId, plano || "pro", billingType, cupomDesconto);
        paymentUrl = await getSubscriptionPaymentUrl(subscriptionId);
        await prisma.user.update({
          where: { id: user.id },
          data: { asaasCustomerId: customerId, asaasSubscriptionId: subscriptionId },
        });
        } catch (asaasErr) {
          asaasError = asaasErr instanceof Error ? asaasErr.message : "Erro ao integrar com sistema de pagamento";
          console.error("Asaas error:", asaasError);
        }
      }
    }

    return NextResponse.json({ success: true, id: user.id, paymentUrl, asaasError });
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
