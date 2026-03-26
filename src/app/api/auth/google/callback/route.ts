import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

interface GoogleTokenResponse {
  access_token: string;
  error?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?erro=google_cancelado`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${origin}/api/auth/google/callback`;

  // 1. Trocar código por token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${origin}/login?erro=google_token`);
  }

  // 2. Buscar dados do usuário
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const googleUser = (await userRes.json()) as GoogleUserInfo;

  if (!googleUser.email || !googleUser.verified_email) {
    return NextResponse.redirect(`${origin}/login?erro=google_email`);
  }

  // 3. Checar se já existe usuário com esse googleId ou email
  const existingByGoogle = await prisma.user.findUnique({
    where: { googleId: googleUser.id },
  });

  if (existingByGoogle) {
    // Já tem conta vinculada ao Google → loga direto
    await createSession({
      userId: existingByGoogle.id,
      tipo: existingByGoogle.tipo,
      nome: existingByGoogle.nome,
      sobrenome: existingByGoogle.sobrenome,
      email: existingByGoogle.email,
      avatarUrl: existingByGoogle.avatarUrl || existingByGoogle.avatarGoogleUrl || undefined,
    });
    const dest = existingByGoogle.tipo === "personal" || existingByGoogle.tipo === "ambos"
      ? "/dashboard/personal"
      : "/dashboard/aluno";
    return NextResponse.redirect(`${origin}${dest}`);
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: googleUser.email },
  });

  if (existingByEmail) {
    // Email já cadastrado manualmente → vincula googleId e loga
    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        googleId: googleUser.id,
        avatarGoogleUrl: googleUser.picture,
        avatarUrl: existingByEmail.avatarUrl || googleUser.picture,
      },
    });
    await createSession({
      userId: existingByEmail.id,
      tipo: existingByEmail.tipo,
      nome: existingByEmail.nome,
      sobrenome: existingByEmail.sobrenome,
      email: existingByEmail.email,
      avatarUrl: existingByEmail.avatarUrl || googleUser.picture || undefined,
    });
    const dest = existingByEmail.tipo === "personal" || existingByEmail.tipo === "ambos"
      ? "/dashboard/personal"
      : "/dashboard/aluno";
    return NextResponse.redirect(`${origin}${dest}`);
  }

  // 4. Novo usuário → redireciona para completar perfil
  const payload = Buffer.from(
    JSON.stringify({
      googleId: googleUser.id,
      email: googleUser.email,
      nome: googleUser.given_name || "",
      sobrenome: googleUser.family_name || "",
      avatarUrl: googleUser.picture || "",
    })
  ).toString("base64url");

  return NextResponse.redirect(`${origin}/cadastro/aluno/completar?g=${payload}`);
}
