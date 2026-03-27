import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const personal = await prisma.user.findFirst({
    where: {
      id: params.id,
      tipo: { in: ["personal", "ambos"] },
      status: "ativo",
    },
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      avatarUrl: true,
      modalidades: true,
      regioes: true,
      academias: true,
      valorAproximado: true,
      disponivelEmCasa: true,
      telefone: true,
      isWhatsapp: true,
      asaasCustomerId: true,
      email: true,
      cpf: true,
    },
  });

  if (!personal) return NextResponse.json({ error: "Personal não encontrado" }, { status: 404 });

  return NextResponse.json(personal);
}
