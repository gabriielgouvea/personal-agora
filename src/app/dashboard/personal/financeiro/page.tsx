"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  ArrowDownCircle,
  Building2,
  CircleDollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface Saque {
  id: string;
  valor: number;
  destino: string;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  contaNumero: string | null;
  tipoConta: string | null;
  status: string;
  obs: string | null;
  processadoEm: string | null;
  createdAt: string;
}

interface FinanceiroData {
  totalEarned: number;
  totalWithdrawn: number;
  saldoDisponivel: number;
  saques: Saque[];
}

interface ContaData {
  tipoChavePix: string | null;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  contaBancaria: string | null;
  tipoConta: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pendente: { label: "Pendente", color: "text-yellow-400 bg-yellow-400/10", icon: <Clock className="h-3 w-3" /> },
  processando: { label: "Processando", color: "text-blue-400 bg-blue-400/10", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  pago: { label: "Pago", color: "text-green-400 bg-green-400/10", icon: <CheckCircle2 className="h-3 w-3" /> },
  recusado: { label: "Recusado", color: "text-red-400 bg-red-400/10", icon: <XCircle className="h-3 w-3" /> },
};

const TIPO_CHAVE_PIX = ["CPF", "CNPJ", "EMAIL", "PHONE", "EVP"];
const TIPO_CONTA = [
  { value: "corrente", label: "Conta Corrente" },
  { value: "poupanca", label: "Conta Poupança" },
];

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function FinanceiroPage() {
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [conta, setConta] = useState<ContaData>({
    tipoChavePix: null, chavePix: null,
    banco: null, agencia: null, contaBancaria: null, tipoConta: null,
  });
  const [contaLoading, setContaLoading] = useState(true);
  const [contaSaving, setContaSaving] = useState(false);
  const [contaMsg, setContaMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Modal saque
  const [showSaque, setShowSaque] = useState(false);
  const [saqueDestino, setSaqueDestino] = useState<"pix" | "banco">("pix");
  const [saqueValor, setSaqueValor] = useState("");
  const [saqueChavePix, setSaqueChavePix] = useState("");
  const [saqueBanco, setSaqueBanco] = useState("");
  const [saqueAgencia, setSaqueAgencia] = useState("");
  const [saqueContaNumero, setSaqueContaNumero] = useState("");
  const [saqueTipoConta, setSaqueTipoConta] = useState("corrente");
  const [saqueLoading, setSaqueLoading] = useState(false);
  const [saqueError, setSaqueError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await fetch("/api/me/financeiro");
      if (r.ok) setData(await r.json());
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    fetch("/api/me/conta-pagamento")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setConta(d); })
      .finally(() => setContaLoading(false));
  }, [loadData]);

  async function handleSalvarConta() {
    setContaSaving(true);
    setContaMsg(null);
    try {
      const r = await fetch("/api/me/conta-pagamento", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conta),
      });
      if (r.ok) {
        setContaMsg({ type: "ok", text: "Dados salvos com sucesso!" });
      } else {
        const j = await r.json();
        setContaMsg({ type: "err", text: j.error ?? "Erro ao salvar." });
      }
    } catch {
      setContaMsg({ type: "err", text: "Erro de conexão." });
    } finally {
      setContaSaving(false);
    }
  }

  async function handleSolicitarSaque() {
    setSaqueLoading(true);
    setSaqueError(null);
    const valor = parseFloat(saqueValor.replace(",", "."));
    if (!valor || valor <= 0) {
      setSaqueError("Informe um valor válido.");
      setSaqueLoading(false);
      return;
    }
    try {
      const body =
        saqueDestino === "pix"
          ? { valor, destino: "pix", chavePix: saqueChavePix }
          : { valor, destino: "banco", banco: saqueBanco, agencia: saqueAgencia, contaNumero: saqueContaNumero, tipoConta: saqueTipoConta };

      const r = await fetch("/api/me/saques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) {
        setSaqueError(j.error ?? "Erro ao solicitar saque.");
        return;
      }
      setShowSaque(false);
      setSaqueValor("");
      setSaqueChavePix("");
      setSaqueBanco("");
      setSaqueAgencia("");
      setSaqueContaNumero("");
      await loadData();
    } catch {
      setSaqueError("Erro de conexão. Tente novamente.");
    } finally {
      setSaqueLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black italic tracking-tight">Financeiro</h1>
        <p className="text-zinc-500 text-sm mt-1">Saldo, saques e dados de pagamento</p>
      </div>

      {/* Saldo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Wallet className="h-5 w-5" />
          <h2 className="font-bold text-sm">Saldo disponível</h2>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-7 w-7 border-2 border-yellow-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="text-center py-4">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Disponível para saque</p>
              <p className="text-4xl font-black text-yellow-400">
                {formatCurrency(data?.saldoDisponivel ?? 0)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-zinc-800/60 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                  <CircleDollarSign className="h-3.5 w-3.5" />
                  Total ganho
                </div>
                <p className="font-bold text-green-400">{formatCurrency(data?.totalEarned ?? 0)}</p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                  <ArrowDownCircle className="h-3.5 w-3.5" />
                  Total sacado
                </div>
                <p className="font-bold text-zinc-300">{formatCurrency(data?.totalWithdrawn ?? 0)}</p>
              </div>
            </div>

            <button
              onClick={() => { setShowSaque(true); setSaqueError(null); }}
              disabled={(data?.saldoDisponivel ?? 0) <= 0}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-colors"
            >
              Solicitar saque
            </button>
            {(data?.saldoDisponivel ?? 0) <= 0 && (
              <p className="text-xs text-zinc-500 text-center">
                Você não possui saldo disponível para saque no momento.
              </p>
            )}
          </>
        )}
      </div>

      {/* Histórico de saques */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <ArrowDownCircle className="h-5 w-5" />
          <h2 className="font-bold text-sm">Histórico de saques</h2>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-7 w-7 border-2 border-yellow-500 border-t-transparent rounded-full" />
          </div>
        ) : !data?.saques.length ? (
          <p className="text-sm text-zinc-500 text-center py-4">Nenhum saque solicitado ainda.</p>
        ) : (
          <div className="space-y-3">
            {data.saques.map((s) => {
              const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.pendente;
              return (
                <div key={s.id} className="bg-zinc-800/60 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">{formatCurrency(s.valor)}</p>
                    <p className="text-xs text-zinc-500">
                      {s.destino === "pix" ? `PIX — ${s.chavePix}` : `Banco — Ag. ${s.agencia} / Cc. ${s.contaNumero}`}
                    </p>
                    <p className="text-xs text-zinc-600">{formatDate(s.createdAt)}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.color}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dados de conta */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-zinc-400">
          <Building2 className="h-5 w-5" />
          <h2 className="font-bold text-sm">Dados de conta para recebimento</h2>
        </div>

        {contaLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-7 w-7 border-2 border-yellow-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Chave PIX</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Tipo de chave</label>
                  <div className="relative">
                    <select
                      value={conta.tipoChavePix ?? ""}
                      onChange={(e) => setConta((p) => ({ ...p, tipoChavePix: e.target.value || null }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-yellow-500 transition-colors"
                    >
                      <option value="">Selecione...</option>
                      {TIPO_CHAVE_PIX.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Chave PIX</label>
                  <input
                    value={conta.chavePix ?? ""}
                    onChange={(e) => setConta((p) => ({ ...p, chavePix: e.target.value || null }))}
                    placeholder="Sua chave PIX"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
              </div>

              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest pt-2">Dados bancários (opcional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Banco</label>
                  <input
                    value={conta.banco ?? ""}
                    onChange={(e) => setConta((p) => ({ ...p, banco: e.target.value || null }))}
                    placeholder="Ex: Nubank, Bradesco..."
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Agência</label>
                  <input
                    value={conta.agencia ?? ""}
                    onChange={(e) => setConta((p) => ({ ...p, agencia: e.target.value || null }))}
                    placeholder="Ex: 0001"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Número da conta</label>
                  <input
                    value={conta.contaBancaria ?? ""}
                    onChange={(e) => setConta((p) => ({ ...p, contaBancaria: e.target.value || null }))}
                    placeholder="Ex: 123456-7"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Tipo de conta</label>
                  <div className="relative">
                    <select
                      value={conta.tipoConta ?? ""}
                      onChange={(e) => setConta((p) => ({ ...p, tipoConta: e.target.value || null }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-yellow-500 transition-colors"
                    >
                      <option value="">Selecione...</option>
                      {TIPO_CONTA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {contaMsg && (
              <p className={`text-xs px-3 py-2 rounded-lg ${contaMsg.type === "ok" ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                {contaMsg.text}
              </p>
            )}

            <button
              onClick={handleSalvarConta}
              disabled={contaSaving}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors"
            >
              {contaSaving ? "Salvando..." : "Salvar dados"}
            </button>
          </>
        )}
      </div>

      {/* Modal de saque */}
      {showSaque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-5">
            <div>
              <h2 className="font-black text-lg">Solicitar saque</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Saldo disponível:{" "}
                <strong className="text-yellow-400">{formatCurrency(data?.saldoDisponivel ?? 0)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Valor (R$)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={saqueValor}
                onChange={(e) => setSaqueValor(e.target.value)}
                placeholder="0,00"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Destino</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaqueDestino("pix")}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition ${
                    saqueDestino === "pix" ? "border-yellow-500 bg-yellow-500/10 text-yellow-400" : "border-zinc-700 bg-zinc-800 text-zinc-300"
                  }`}
                >
                  ⚡ PIX
                </button>
                <button
                  onClick={() => setSaqueDestino("banco")}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition ${
                    saqueDestino === "banco" ? "border-yellow-500 bg-yellow-500/10 text-yellow-400" : "border-zinc-700 bg-zinc-800 text-zinc-300"
                  }`}
                >
                  🏦 Conta bancária
                </button>
              </div>
            </div>

            {saqueDestino === "pix" ? (
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Chave PIX</label>
                <input
                  value={saqueChavePix}
                  onChange={(e) => setSaqueChavePix(e.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Banco</label>
                  <input
                    value={saqueBanco}
                    onChange={(e) => setSaqueBanco(e.target.value)}
                    placeholder="Nome do banco"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Agência</label>
                    <input
                      value={saqueAgencia}
                      onChange={(e) => setSaqueAgencia(e.target.value)}
                      placeholder="0001"
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Número da conta</label>
                    <input
                      value={saqueContaNumero}
                      onChange={(e) => setSaqueContaNumero(e.target.value)}
                      placeholder="123456-7"
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Tipo de conta</label>
                  <div className="relative">
                    <select
                      value={saqueTipoConta}
                      onChange={(e) => setSaqueTipoConta(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-yellow-500 transition-colors"
                    >
                      {TIPO_CONTA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {saqueError && (
              <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{saqueError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaque(false)}
                disabled={saqueLoading}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSolicitarSaque}
                disabled={saqueLoading}
                className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors"
              >
                {saqueLoading ? "Enviando..." : "Solicitar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
