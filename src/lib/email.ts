import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://personal-agora.vercel.app";

export async function sendPasswordResetEmail(
  email: string,
  nome: string,
  token: string
) {
  const resetUrl = `${APP_URL}/login/redefinir-senha?token=${token}`;

  await transporter.sendMail({
    from: `"Personal Agora" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Redefinição de senha - Personal Agora",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px">Olá, ${nome}!</h2>
        <p style="color:#555">Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Personal Agora</strong>.</p>
        <p style="color:#555">Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>1 hora</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 28px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Redefinir senha
        </a>
        <p style="color:#888;font-size:13px">Se você não solicitou isso, ignore este e-mail. Sua senha não será alterada.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Personal Agora &mdash; plataforma de personal trainers</p>
      </div>
    `,
  });
}
