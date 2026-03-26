import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("cpf")?.replace(/\D/g, "");

  if (!raw || raw.length !== 11) {
    return NextResponse.json({ exists: false, tipo: null });
  }

  // CPF is stored with mask in DB (e.g. "000.000.000-00")
  const formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;

  const user = await prisma.user.findUnique({
    where: { cpf: formatted },
    select: { tipo: true },
  });

  if (!user) return NextResponse.json({ exists: false, tipo: null });
  return NextResponse.json({ exists: true, tipo: user.tipo });
}
