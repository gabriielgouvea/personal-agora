"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RedefinirSenhaContent />
    </Suspense>
  );
}

function RedefinirSenhaContent() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Link inválido. Solicite um novo link de redefinição.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (novaSenha !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao redefinir senha.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-10">
          <span className="text-2xl font-bold italic uppercase tracking-tighter">
            Personal <span className="text-yellow-500">Agora</span>
          </span>
        </Link>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-2xl font-black uppercase italic tracking-tight mb-2 text-center">
            Nova senha
          </h1>
          <p className="text-sm text-zinc-400 text-center mb-6">
            Escolha uma nova senha para sua conta.
          </p>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-lg text-center">
              <p className="font-semibold mb-1">Senha redefinida!</p>
              <p>Você será redirecionado para o login em instantes...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition pr-12"
                      placeholder="mínimo 6 caracteres"
                      required
                      minLength={6}
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

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Confirmar senha</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition"
                    placeholder="repita a senha"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar nova senha"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}
