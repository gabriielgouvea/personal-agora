import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  dateOfBirth: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Data inválida" }),
  gender: z.enum(["masculino", "feminino", "outro"]),
  studentGenderPreference: z.enum([
    "somente_masculino",
    "somente_feminino",
    "todos",
    "todos_pref_mulher",
    "todos_pref_homem"
  ]),
  academies: z.string().min(1, "Informe as academias"),
  residentialAvailable: z.boolean(),
  cref: z.string().min(4, "CREF inválido").max(20, "CREF muito longo"),
  crefValidity: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Data inválida" }),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  email: z.string().email("Email inválido"),
  instagram: z.string().optional(),
  contactConsent: z.boolean().refine(val => val === true, "É necessário autorizar o contato"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simple validation for check
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.formErrors.fieldErrors }, { status: 400 });
    }

    const { dateOfBirth, crefValidity, ...rest } = result.data;

    const personal = await prisma.personalTrainer.create({
      data: {
        ...rest,
        dateOfBirth: new Date(dateOfBirth),
        crefValidity: new Date(crefValidity),
      },
    });

    return NextResponse.json({ success: true, id: personal.id });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "CREF já cadastrado." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao salvar o cadastro." }, { status: 500 });
  }
}
