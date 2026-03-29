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

export async function sendAulaConfirmadaAluno(
  emailAluno: string,
  nomeAluno: string,
  nomePersonal: string,
  valor: number,
  aulaId: string
) {
  const dashboardUrl = `${APP_URL}/dashboard/aluno/aulas`;
  await transporter.sendMail({
    from: `"Personal Agora" <${process.env.GMAIL_USER}>`,
    to: emailAluno,
    subject: "Compra concluída — aguardando confirmação do personal! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="margin:0 0 4px;color:#111">Olá, ${nomeAluno}!</h2>
        <p style="color:#555;margin:0 0 20px">Sua compra foi concluída com sucesso! O personal <strong>${nomePersonal}</strong> foi notificado e estamos aguardando a confirmação do agendamento.</p>
        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;color:#333;font-size:14px"><strong>Detalhes da reserva:</strong></p>
          <p style="margin:0 0 4px;color:#555;font-size:14px">Personal: <strong>${nomePersonal}</strong></p>
          <p style="margin:0 0 4px;color:#555;font-size:14px">Valor pago: <strong>R$ ${valor.toFixed(2).replace(".", ",")}</strong></p>
          <p style="margin:0;color:#555;font-size:14px">ID da reserva: <code style="font-size:12px;color:#888">${aulaId}</code></p>
        </div>
        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#713f12;font-size:13px">⏳ <strong>Próximo passo:</strong> O personal precisa aceitar a aula. Você receberá um e-mail assim que ele confirmar. Acompanhe o status na aba "Minhas Aulas".</p>
        </div>
        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 28px;background:#eab308;color:#000;text-decoration:none;border-radius:8px;font-weight:700">
          Acompanhar minha aula
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Personal Agora &mdash; plataforma de personal trainers</p>
      </div>
    `,
  });
}

export async function sendAulaConfirmadaPersonal(
  emailPersonal: string,
  nomePersonal: string,
  nomeAluno: string,
  valor: number,
  aulaId: string
) {
  const dashboardUrl = `${APP_URL}/dashboard/personal/aulas`;
  await transporter.sendMail({
    from: `"Personal Agora" <${process.env.GMAIL_USER}>`,
    to: emailPersonal,
    subject: `Nova aula reservada — ${nomeAluno} contratou você! 💪`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="margin:0 0 4px;color:#111">Olá, ${nomePersonal}!</h2>
        <p style="color:#555;margin:0 0 20px">Ótima notícia! <strong>${nomeAluno}</strong> acabou de reservar uma aula com você pela plataforma.</p>
        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;color:#333;font-size:14px"><strong>Detalhes da reserva:</strong></p>
          <p style="margin:0 0 4px;color:#555;font-size:14px">Aluno: <strong>${nomeAluno}</strong></p>
          <p style="margin:0 0 4px;color:#555;font-size:14px">Valor: <strong>R$ ${valor.toFixed(2).replace(".", ",")}</strong></p>
          <p style="margin:0;color:#555;font-size:14px">ID da reserva: <code style="font-size:12px;color:#888">${aulaId}</code></p>
        </div>
        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#713f12;font-size:13px">⚠️ <strong>Ação necessária:</strong> Acesse a plataforma e <strong>aceite a aula</strong> para confirmar o agendamento. O aluno está aguardando sua confirmação.</p>
        </div>
        <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:10px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#7f1d1d;font-size:13px">🚨 <strong>Atenção:</strong> Cancelamentos com menos de 12h geram advertência. Acumular 3 advertências em 30 dias resulta em suspensão da conta. Mantenha sua reputação!</p>
        </div>
        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 28px;background:#eab308;color:#000;text-decoration:none;border-radius:8px;font-weight:700">
          Aceitar aula agora
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Personal Agora &mdash; plataforma de personal trainers</p>
      </div>
    `,
  });
}

export async function sendAulaConfirmadaAdmin(
  nomeAluno: string,
  nomePersonal: string,
  emailPersonal: string,
  valor: number,
  aulaId: string
) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.GMAIL_USER || "";
  if (!adminEmail) return;
  await transporter.sendMail({
    from: `"Personal Agora" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `[ADMIN] Nova aula paga: ${nomeAluno} → ${nomePersonal}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="margin:0 0 16px;color:#111">Nova aula confirmada</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#555;width:120px">Aluno:</td><td style="color:#111;font-weight:600">${nomeAluno}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Personal:</td><td style="color:#111;font-weight:600">${nomePersonal} (${emailPersonal})</td></tr>
          <tr><td style="padding:6px 0;color:#555">Valor:</td><td style="color:#111;font-weight:600">R$ ${valor.toFixed(2).replace(".", ",")}</td></tr>
          <tr><td style="padding:6px 0;color:#555">ID Aula:</td><td style="color:#888;font-size:12px">${aulaId}</td></tr>
        </table>
        <p style="margin-top:20px;color:#888;font-size:12px">Personal Agora &mdash; notificação automática</p>
      </div>
    `,
  });
}

export async function sendAulaAceitaAluno(
  emailAluno: string,
  nomeAluno: string,
  nomePersonal: string,
  valor: number,
  aulaId: string
) {
  const dashboardUrl = `${APP_URL}/dashboard/aluno/aulas`;
  await transporter.sendMail({
    from: `"Personal Agora" <${process.env.GMAIL_USER}>`,
    to: emailAluno,
    subject: `${nomePersonal} aceitou sua aula! ✅`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="margin:0 0 4px;color:#111">Olá, ${nomeAluno}!</h2>
        <p style="color:#555;margin:0 0 20px">Ótima notícia! O personal <strong>${nomePersonal}</strong> aceitou sua aula. O agendamento está confirmado!</p>
        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;color:#333;font-size:14px"><strong>Detalhes:</strong></p>
          <p style="margin:0 0 4px;color:#555;font-size:14px">Personal: <strong>${nomePersonal}</strong></p>
          <p style="margin:0 0 4px;color:#555;font-size:14px">Valor: <strong>R$ ${valor.toFixed(2).replace(".", ",")}</strong></p>
          <p style="margin:0;color:#555;font-size:14px">ID: <code style="font-size:12px;color:#888">${aulaId}</code></p>
        </div>
        <div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#14532d;font-size:13px">✅ <strong>Próximo passo:</strong> Após a aula ser realizada, confirme no seu painel clicando em "Aula realizada" para liberar o pagamento ao personal.</p>
        </div>
        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 28px;background:#eab308;color:#000;text-decoration:none;border-radius:8px;font-weight:700">
          Ver minha aula
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Personal Agora &mdash; plataforma de personal trainers</p>
      </div>
    `,
  });
}

export async function sendStatusAlteradoAluno(
  emailAluno: string,
  nomeAluno: string,
  nomePersonal: string,
  novoStatus: string,
  aulaId: string
) {
  const dashboardUrl = `${APP_URL}/dashboard/aluno/aulas`;

  const statusMap: Record<string, { subject: string; msg: string }> = {
    cancelada: {
      subject: `Aula cancelada — ${nomePersonal}`,
      msg: `Sua aula com <strong>${nomePersonal}</strong> foi cancelada. Verifique os detalhes no seu painel.`,
    },
    reembolsada: {
      subject: `Reembolso processado — aula com ${nomePersonal}`,
      msg: `O reembolso da sua aula com <strong>${nomePersonal}</strong> foi processado. O valor será devolvido em breve.`,
    },
    confirmada: {
      subject: `Aula confirmada — pagamento liberado! ✅`,
      msg: `Sua confirmação de aula com <strong>${nomePersonal}</strong> foi registrada e o pagamento foi liberado ao personal.`,
    },
  };

  const info = statusMap[novoStatus];
  if (!info) return;

  await transporter.sendMail({
    from: `"Personal Agora" <${process.env.GMAIL_USER}>`,
    to: emailAluno,
    subject: info.subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="margin:0 0 4px;color:#111">Olá, ${nomeAluno}!</h2>
        <p style="color:#555;margin:0 0 20px">${info.msg}</p>
        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0;color:#555;font-size:14px">ID da reserva: <code style="font-size:12px;color:#888">${aulaId}</code></p>
        </div>
        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 28px;background:#eab308;color:#000;text-decoration:none;border-radius:8px;font-weight:700">
          Ver minhas aulas
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Personal Agora &mdash; plataforma de personal trainers</p>
      </div>
    `,
  });
}
