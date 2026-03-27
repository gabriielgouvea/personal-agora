import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import prisma from "@/lib/prisma";

const utapi = new UTApi();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData();
    const fotoPerfil = formData.get("fotoPerfil") as File | null;
    const fotoCref = formData.get("fotoCref") as File | null;
    const selfie = formData.get("selfie") as File | null;

    const updates: { avatarUrl?: string; fotoCrefUrl?: string; selfieUrl?: string } = {};

    if (fotoPerfil && fotoPerfil.size > 0) {
      const [res] = await utapi.uploadFiles([fotoPerfil]);
      if (res.data?.url) updates.avatarUrl = res.data.url;
    }

    if (fotoCref && fotoCref.size > 0) {
      const [res] = await utapi.uploadFiles([fotoCref]);
      if (res.data?.url) updates.fotoCrefUrl = res.data.url;
    }

    if (selfie && selfie.size > 0) {
      const [res] = await utapi.uploadFiles([selfie]);
      if (res.data?.url) updates.selfieUrl = res.data.url;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: params.id },
        data: updates,
      });
    }

    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    console.error("Erro no upload de documentos:", error);
    return NextResponse.json({ error: "Erro ao fazer upload dos arquivos" }, { status: 500 });
  }
}
