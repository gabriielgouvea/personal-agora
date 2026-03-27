"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar e-mail. Tente novamente.");
      } else {
        setSuccess(true);
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
            Esqueceu a senha?
          </h1>
          <p className="text-sm text-zinc-400 text-center mb-6">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-lg text-center">
              <p className="font-semibold mb-1">E-mail enviado!</p>
              <p>Verifique sua caixa de entrada (e o spam). O link é válido por 1 hora.</p>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar link de redefinição"}
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
