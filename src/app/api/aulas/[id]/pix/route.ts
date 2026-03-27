import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPixQrCode } from "@/lib/asaas";

// GET /api/aulas/[id]/pix — retorna QR Code PIX da aula
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const aula = await prisma.aula.findUnique({
    where: { id: params.id },
    select: { alunoId: true, asaasChargeId: true, status: true },
  });

  if (!aula) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  if (aula.alunoId !== session.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  if (!aula.asaasChargeId) {
    return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 400 });
  }

  try {
    const pix = await getPixQrCode(aula.asaasChargeId);
    return NextResponse.json({
      qrCodeImage: pix.encodedImage,
      qrCodeText: pix.payload,
      expirationDate: pix.expirationDate,
      status: aula.status,
    });
  } catch (error) {
    console.error("Erro ao buscar QR Code:", error);
    const message = error instanceof Error ? error.message : "Erro ao gerar QR Code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
