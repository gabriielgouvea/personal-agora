"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const erro = searchParams.get("erro");
    if (erro === "google_cancelado") setError("Login com Google cancelado.");
    else if (erro === "google_token") setError("Erro ao autenticar com Google. Tente novamente.");
    else if (erro === "google_email") setError("O e-mail Google não foi verificado.");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !senha) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao fazer login.");
        setLoading(false);
        return;
      }
      // Redirecionar para o dashboard por tipo
      const dest = data.tipo === "personal" || data.tipo === "ambos" ? "/dashboard/personal" : "/dashboard/aluno";
      router.push(dest);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 selection:bg-yellow-500 selection:text-black">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-10">
          <span className="text-2xl font-bold italic uppercase tracking-tighter">
            Personal <span className="text-yellow-500">Agora</span>
          </span>
        </Link>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-2xl font-black uppercase italic tracking-tight mb-6 text-center">Entrar</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="text-center">
              <Link
                href="/login/esqueceu-senha"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-zinc-900/60 px-3 text-xs text-zinc-500">ou continue com</span>
            </div>
          </div>

          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-lg transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </a>

          <div className="mt-6 text-center">
            <Link href="/cadastro" className="text-sm text-zinc-400 hover:text-yellow-500 transition">
              Não tem conta? <span className="font-semibold text-yellow-500">Cadastre-se</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para home
          </Link>
        </div>
      </div>
    </main>
  );
}
