import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/admin-auth";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Seed Admin</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#0a0a0a;border:1px solid #27272a;border-radius:16px;padding:32px;width:100%;max-width:400px}
h1{font-size:20px;font-weight:800;text-transform:uppercase;font-style:italic;margin-bottom:4px}h1 span{color:#eab308}
p{color:#71717a;font-size:13px;margin-bottom:24px}
label{display:block;color:#a1a1aa;font-size:12px;margin-bottom:4px;text-transform:uppercase}
input{width:100%;background:#18181b;border:1px solid #27272a;border-radius:8px;padding:10px 14px;color:#fff;font-size:14px;margin-bottom:12px;outline:none}
input:focus{border-color:#eab308}
button{width:100%;background:#eab308;color:#000;font-weight:700;padding:12px;border:none;border-radius:8px;font-size:14px;cursor:pointer}
button:hover{background:#facc15}
.msg{padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:16px}
.err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#f87171}
.ok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#4ade80}
</style></head><body>
<div class="card">
<h1>Personal <span>Agora</span></h1>
<p>Criar primeiro administrador</p>
<div id="msg"></div>
<form id="f">
<label>Secret</label><input name="secret" required placeholder="ascora-setup-2026">
<label>Nome</label><input name="nome" required placeholder="Seu nome">
<label>E-mail</label><input name="email" type="email" required placeholder="admin@email.com">
<label>Senha</label><input name="senha" type="password" required minlength="6" placeholder="Mínimo 6 caracteres">
<button type="submit">Criar Admin</button>
</form>
<script>
document.getElementById('f').onsubmit=async e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
  const m=document.getElementById('msg');m.innerHTML='';
  const r=await fetch('/api/admin/seed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
  const j=await r.json();
  if(r.ok){m.innerHTML='<div class="msg ok">Admin criado! Redirecionando...</div>';setTimeout(()=>location.href='/painel/login',1500)}
  else{m.innerHTML='<div class="msg err">'+(j.error||'Erro')+'</div>'}
};
</script>
</div></body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  try {
    const { secret, nome, email, senha } = await request.json();

    // Proteção: só funciona com um secret
    if (secret !== process.env.ADMIN_SEED_SECRET && secret !== "ascora-setup-2026") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Admin já existe." }, { status: 409 });
    }

    const hashed = await hashPassword(senha);
    const admin = await prisma.admin.create({
      data: { nome, email, senha: hashed },
    });

    return NextResponse.json({ success: true, id: admin.id });
  } catch (error: unknown) {
    console.error("Erro seed admin:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
