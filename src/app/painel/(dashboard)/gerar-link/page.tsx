"use client";

import { useState } from "react";
import { Search, Link2, Copy, Check, Loader2 } from "lucide-react";

interface UserResult {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  plano: string | null;
  planoAtivo: boolean;
}

const PLAN_VALUES: Record<string, number> = { start: 29.9, pro: 49.9, elite: 99.9 };

export default function GerarLinkPage() {
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<UserResult[]>([]);
  const [selecionado, setSelecionado] = useState<UserResult | null>(null);
  const [billingType, setBillingType] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [desconto, setDesconto] = useState("");
  const [gerando, setGerando] = useState(false);
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [valorFinal, setValorFinal] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  async function buscarPersonals() {
    if (!busca.trim()) return;
    setBuscando(true);
    setResultados([]);
    setSelecionado(null);
    setLinkGerado(null);
    setErro("");
    try {
      const res = await fetch(`/api/admin/users?tipo=personal&busca=${encodeURIComponent(busca)}&limit=10`);
      const data = await res.json();
      setResultados(data.users || []);
    } catch {
      setErro("Erro ao buscar personais");
    }
    setBuscando(false);
  }

  async function gerarLink() {
    if (!selecionado) return;
    setGerando(true);
    setLinkGerado(null);
    setErro("");
    try {
      const res = await fetch("/api/admin/gerar-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selecionado.id,
          billingType,
          desconto: desconto ? parseFloat(desconto) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao gerar link");
      } else {
        setLinkGerado(data.paymentUrl);
        setValorFinal(data.valorFinal);
      }
    } catch {
      setErro("Erro de conexão");
    }
    setGerando(false);
  }

  async function copiar() {
    if (!linkGerado) return;
    await navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const plano = selecionado?.plano || "pro";
  const base = PLAN_VALUES[plano] ?? 49.9;
  const desc = desconto ? parseFloat(desconto) : 0;
  const preview = desc > 0 ? Math.max(parseFloat((base - base * (desc / 100)).toFixed(2)), 0) : base;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Link2 className="w-5 h-5 text-yellow-500" />
          Gerar Link de Pagamento
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Gere um link de assinatura Asaas para um personal trainer e envie para ele pagar.
        </p>
      </div>

      {/* Busca */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <p className="text-sm font-medium text-zinc-300">1. Buscar personal</p>
        <div className="flex gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarPersonals()}
            placeholder="Nome, e-mail ou CPF..."
            className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 text-sm"
          />
          <button
            onClick={buscarPersonals}
            disabled={buscando}
            className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </div>

        {resultados.length > 0 && !selecionado && (
          <div className="space-y-2">
            {resultados.map((u) => (
              <button
                key={u.id}
                onClick={() => { setSelecionado(u); setResultados([]); setLinkGerado(null); setDesconto(""); }}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 transition text-left"
              >
                <div>
                  <p className="text-sm font-medium text-white">{u.nome} {u.sobrenome}</p>
                  <p className="text-xs text-zinc-500">{u.email} · CPF: {u.cpf}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-yellow-500 font-bold uppercase">{u.plano || "sem plano"}</p>
                  <p className={`text-xs ${u.planoAtivo ? "text-green-400" : "text-red-400"}`}>
                    {u.planoAtivo ? "ativo" : "inativo"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {resultados.length === 0 && busca && !buscando && !selecionado && (
          <p className="text-zinc-500 text-xs">Nenhum resultado encontrado.</p>
        )}

        {selecionado && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div>
              <p className="text-sm font-bold text-white">{selecionado.nome} {selecionado.sobrenome}</p>
              <p className="text-xs text-zinc-400">{selecionado.email} · Plano: <span className="text-yellow-500 font-bold uppercase">{selecionado.plano || "pro"}</span></p>
            </div>
            <button
              onClick={() => { setSelecionado(null); setLinkGerado(null); setBusca(""); }}
              className="text-zinc-500 hover:text-zinc-300 text-xs underline"
            >
              Trocar
            </button>
          </div>
        )}
      </div>

      {/* Config */}
      {selecionado && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <p className="text-sm font-medium text-zinc-300">2. Configurar pagamento</p>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">Forma de pagamento</label>
            <div className="grid grid-cols-2 gap-3">
              {(["PIX", "CREDIT_CARD"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBillingType(b)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition text-sm font-bold ${
                    billingType === b
                      ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  {b === "PIX" ? "⚡ PIX" : "💳 Cartão de crédito"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">Desconto (% opcional)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                placeholder="0"
                className="w-28 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 text-sm"
              />
              <span className="text-zinc-500 text-sm">%</span>
              <div className="ml-auto text-right">
                {desc > 0 && (
                  <p className="text-xs text-zinc-500 line-through">
                    R$ {base.toFixed(2).replace(".", ",")}
                  </p>
                )}
                <p className="text-lg font-black text-yellow-500">
                  R$ {preview.toFixed(2).replace(".", ",")}
                  <span className="text-xs text-zinc-500 font-normal">/mês</span>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={gerarLink}
            disabled={gerando}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {gerando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}
            {gerando ? "Gerando..." : "Gerar link de pagamento"}
          </button>

          {erro && (
            <p className="text-red-400 text-sm text-center">{erro}</p>
          )}
        </div>
      )}

      {/* Link gerado */}
      {linkGerado && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-green-400 font-bold text-sm">
              Link gerado! Valor: R$ {(valorFinal ?? preview).toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={linkGerado}
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-xs truncate"
            />
            <button
              onClick={copiar}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition ${
                copiado
                  ? "bg-green-500 text-black"
                  : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-yellow-500"
              }`}
            >
              {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <a
            href={linkGerado}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-yellow-500 hover:text-yellow-400 underline"
          >
            Abrir link →
          </a>
        </div>
      )}
    </div>
  );
}
