"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { maskPhone, maskCPF, maskDate } from "@/lib/masks";

interface GoogleData {
  googleId: string;
  email: string;
  nome: string;
  sobrenome: string;
  avatarUrl: string;
}

export default function CompletarPerfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" /></div>}>
      <CompletarPerfilContent />
    </Suspense>
  );
}

function CompletarPerfilContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [googleData, setGoogleData] = useState<GoogleData | null>(null);
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [isWhatsapp, setIsWhatsapp] = useState(true);
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const g = searchParams.get("g");
    if (!g) { router.replace("/login"); return; }
    try {
      const decoded = JSON.parse(Buffer.from(g, "base64").toString("utf-8")) as GoogleData;
      setGoogleData(decoded);
      setNome(decoded.nome);
      setSobrenome(decoded.sobrenome);
    } catch {
      router.replace("/login");
    }
  }, [searchParams, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!googleData) return;
    setError("");

    if (!telefone || !cpf || !dataNascimento || !sexo) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/cadastro/aluno/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        googleId: googleData.googleId,
        email: googleData.email,
        nome,
        sobrenome,
        avatarUrl: googleData.avatarUrl,
        telefone,
        isWhatsapp,
        isTelefone: !isWhatsapp,
        dataNascimento,
        sexo,
        cpf,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || data.error || "Erro ao criar conta.");
      return;
    }

    router.replace("/dashboard/aluno");
  }

  if (!googleData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition";
  const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";
  const errorCls = "text-red-400 text-xs mt-1";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold italic uppercase tracking-tighter">
            Personal <span className="text-yellow-500">Agora</span>
          </span>
          <p className="text-zinc-400 text-sm mt-2">Quase lá! Complete seu perfil para continuar.</p>
        </div>

        {/* Card com dados do Google */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 mb-6">
          {googleData.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={googleData.avatarUrl} alt="" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <p className="font-semibold text-sm">{googleData.email}</p>
            <p className="text-xs text-zinc-500">Conta Google vinculada</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputCls}
                placeholder="Nome"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Sobrenome</label>
              <input
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                className={inputCls}
                placeholder="Sobrenome"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Telefone</label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
              className={inputCls}
              placeholder="(11) 99999-9999"
              required
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="whatsapp"
                checked={isWhatsapp}
                onChange={(e) => setIsWhatsapp(e.target.checked)}
                className="accent-yellow-500"
              />
              <label htmlFor="whatsapp" className="text-sm text-zinc-400">Este número é WhatsApp</label>
            </div>
          </div>

          <div>
            <label className={labelCls}>CPF</label>
            <input
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              className={inputCls}
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div>
            <label className={labelCls}>Data de Nascimento</label>
            <input
              value={dataNascimento}
              onChange={(e) => setDataNascimento(maskDate(e.target.value))}
              className={inputCls}
              placeholder="DD/MM/AAAA"
              required
            />
          </div>

          <div>
            <label className={labelCls}>Sexo</label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              className={`${inputCls} appearance-none`}
              required
            >
              <option value="" disabled>Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Prefiro não informar</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm transition"
          >
            {loading ? "Criando conta..." : "Concluir cadastro"}
          </button>
        </form>
      </div>
    </main>
  );
}
