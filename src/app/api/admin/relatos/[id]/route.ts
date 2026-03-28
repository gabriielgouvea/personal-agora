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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { status, respostaAdmin } = body;

  const validStatuses = ["pendente", "em_analise", "resolvido", "arquivado"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const relato = await prisma.relato.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(respostaAdmin !== undefined && { respostaAdmin }),
    },
  });

  return NextResponse.json(relato);
}
