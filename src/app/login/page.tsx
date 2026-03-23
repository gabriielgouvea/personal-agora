"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !senha) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    // TODO: integrar com API de autenticação
    setTimeout(() => {
      setLoading(false);
      setError("Login ainda não está disponível. Em breve!");
    }, 1000);
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
          </form>

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
