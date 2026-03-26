"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  invoiceUrl: string | null;
  billingType: string;
}

interface AssinaturaData {
  plano: string | null;
  planoAtivo: boolean;
  planoFim: string | null;
  semAsaas: boolean;
  asaasStatus: string | null;
  nextDueDate: string | null;
  value: number | null;
  cancelamentoPedidoEm: string | null;
  cancelamentoMotivo: string | null;
  overdue: AsaasPayment[];
  pending: AsaasPayment[];
}

const MOTIVOS_CANCELAMENTO = [
  "Não estou usando a plataforma",
  "O preço está alto para mim",
  "Vou usar outra plataforma",
  "Estou sem alunos no momento",
  "Problemas técnicos na plataforma",
  "Outro motivo",
];

const PLANO_LABEL: Record<string, string> = {
  start: "Start",
  pro: "Pro",
  elite: "Elite",
};

const PLANO_COR: Record<string, string> = {
  start: "text-blue-400",
  pro: "text-yellow-400",
  elite: "text-purple-400",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AssinaturaPage() {
  const [data, setData] = useState<AssinaturaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Pagamento em atraso
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payBillingType, setPayBillingType] = useState<"CREDIT_CARD" | "PIX">("PIX");
  const [payLoading, setPayLoading] = useState(false);

  // Ativar plano (sem Asaas)
  const [ativarBillingType, setAtivarBillingType] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [ativarLoading, setAtivarLoading] = useState(false);
  const [ativarError, setAtivarError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/assinatura")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) setError("Não foi possível carregar os dados.");
        else setData(d);
      })
      .catch(() => setError("Erro ao carregar dados da assinatura."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancelar() {
    if (!motivoSelecionado) {
      setCancelError("Selecione um motivo para o cancelamento.");
      return;
    }
    setCancelLoading(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/me/assinatura/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: motivoSelecionado }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCancelError(json.error ?? "Erro ao cancelar.");
        return;
      }
      setShowCancelModal(false);
      setData((prev) =>
        prev
          ? {
              ...prev,
              cancelamentoPedidoEm: new Date().toISOString(),
              cancelamentoMotivo: motivoSelecionado,
              asaasStatus: "INACTIVE",
            }
          : prev
      );
    } catch {
      setCancelError("Erro de conexão. Tente novamente.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handlePagar(paymentId: string) {
    setPayLoading(true);
    setPayError(null);
    try {
      const res = await fetch("/api/me/assinatura/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, billingType: payBillingType }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPayError(json.error ?? "Erro ao gerar link.");
        return;
      }
      window.open(json.url, "_blank");
    } catch {
      setPayError("Erro de conexão. Tente novamente.");
    } finally {
      setPayLoading(false);
    }
  }

  async function handleAtivar() {
    setAtivarLoading(true);
    setAtivarError(null);
    try {
      const res = await fetch("/api/me/assinatura/ativar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingType: ativarBillingType }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAtivarError(json.error ?? "Erro ao iniciar pagamento.");
        return;
      }
      if (json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        setAtivarError("Link de pagamento não disponível. Tente novamente ou contate o suporte.");
      }
    } catch {
      setAtivarError("Erro de conexão. Tente novamente.");
    } finally {
      setAtivarLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
        <AlertTriangle className="h-10 w-10 text-yellow-500" />
        <p>{error ?? "Dados não disponíveis."}</p>
      </div>
    );
  }

  const cancelado = !!data.cancelamentoPedidoEm;
  const planoLabel = data.plano ? (PLANO_LABEL[data.plano] ?? data.plano) : "—";
  const planoCor = data.plano ? (PLANO_COR[data.plano] ?? "text-zinc-300") : "text-zinc-300";
  const hasOverdue = data.overdue && data.overdue.length > 0;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black italic tracking-tight">Assinatura</h1>
        <p className="text-zinc-500 text-sm mt-1">Gerencie seu plano e pagamentos</p>
      </div>

      {/* Status do plano */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Plano atual</p>
            <span className={`text-2xl font-black italic ${planoCor}`}>{planoLabel}</span>
          </div>
          {data.planoAtivo && !cancelado ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ativo
            </span>
          ) : cancelado ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              Cancelamento solicitado
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full">
              <XCircle className="h-3.5 w-3.5" />
              Inativo
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {data.value != null && (
            <div className="bg-zinc-800/60 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Valor mensal</p>
              <p className="font-bold text-white text-base">{formatCurrency(data.value)}</p>
            </div>
          )}
          {data.nextDueDate && !cancelado && (
            <div className="bg-zinc-800/60 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Próxima cobrança</p>
              <p className="font-bold text-white text-base">{formatDate(data.nextDueDate)}</p>
            </div>
          )}
          {data.planoFim && (
            <div className="bg-zinc-800/60 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">
                {cancelado ? "Acesso até" : "Ciclo atual até"}
              </p>
              <p className="font-bold text-white text-base">{formatDate(data.planoFim)}</p>
            </div>
          )}
        </div>

        {cancelado && data.planoFim && (
          <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-sm">
            <Clock className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
            <p className="text-orange-300">
              Sua assinatura foi cancelada. Você terá acesso ao plano{" "}
              <strong>{planoLabel}</strong> até <strong>{formatDate(data.planoFim)}</strong>. Após essa
              data, sua conta será desativada automaticamente.
              {data.cancelamentoMotivo && (
                <span className="block mt-1 text-orange-400/70 text-xs">
                  Motivo informado: {data.cancelamentoMotivo}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Cobranças em atraso */}
      {hasOverdue && (
        <div className="bg-zinc-900 border border-red-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-bold text-sm">
              {data.overdue.length === 1 ? "1 cobrança em atraso" : `${data.overdue.length} cobranças em atraso`}
            </h2>
          </div>

          {payError && (
            <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{payError}</p>
          )}

          {data.overdue.map((payment) => (
            <div key={payment.id} className="bg-zinc-800/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Vencimento</p>
                  <p className="font-semibold text-white text-sm">{formatDate(payment.dueDate)}</p>
                </div>
                <p className="font-bold text-red-400 text-lg">{formatCurrency(payment.value)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-500">Forma de pagamento</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPayingId(payment.id); setPayBillingType("PIX"); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      payingId === payment.id && payBillingType === "PIX"
                        ? "bg-zinc-700 border-yellow-500 text-yellow-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    PIX
                  </button>
                  <button
                    onClick={() => { setPayingId(payment.id); setPayBillingType("CREDIT_CARD"); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      payingId === payment.id && payBillingType === "CREDIT_CARD"
                        ? "bg-zinc-700 border-yellow-500 text-yellow-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    Cartão de crédito
                  </button>
                </div>

                <button
                  onClick={() => handlePagar(payment.id)}
                  disabled={payLoading || payingId !== payment.id}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-colors"
                >
                  {payLoading && payingId === payment.id ? "Gerando link..." : "Ir para pagamento"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cobranças pendentes (próximas) */}
      {data.pending && data.pending.length > 0 && !cancelado && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <CreditCard className="h-5 w-5" />
            <h2 className="font-bold text-sm">Próxima cobrança</h2>
          </div>

          {payError && (
            <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{payError}</p>
          )}

          {data.pending.slice(0, 1).map((payment) => (
            <div key={payment.id} className="bg-zinc-800/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Vencimento</p>
                  <p className="font-semibold text-white text-sm">{formatDate(payment.dueDate)}</p>
                </div>
                <p className="font-bold text-yellow-400 text-lg">{formatCurrency(payment.value)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-500">Escolher forma de pagamento</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPayingId(payment.id); setPayBillingType("PIX"); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      payingId === payment.id && payBillingType === "PIX"
                        ? "bg-zinc-700 border-yellow-500 text-yellow-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    PIX
                  </button>
                  <button
                    onClick={() => { setPayingId(payment.id); setPayBillingType("CREDIT_CARD"); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      payingId === payment.id && payBillingType === "CREDIT_CARD"
                        ? "bg-zinc-700 border-yellow-500 text-yellow-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    Cartão de crédito
                  </button>
                </div>

                <button
                  onClick={() => handlePagar(payment.id)}
                  disabled={payLoading || payingId !== payment.id}
                  className="w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors"
                >
                  {payLoading && payingId === payment.id ? "Gerando link..." : "Pagar agora"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plano inativo — precisa ativar pagamento */}
      {!data.planoAtivo && !cancelado && (data.semAsaas || (!data.overdue?.length && !data.pending?.length)) && (
        <div className="bg-zinc-900 border border-yellow-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <h2 className="font-bold text-sm text-white">Ative seu plano</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Seu cadastro foi aprovado! Para começar a usar a plataforma, realize o pagamento da
                primeira mensalidade. Escolha a forma de pagamento abaixo.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-medium">Forma de pagamento</p>
            <div className="flex gap-3">
              <button
                onClick={() => setAtivarBillingType("PIX")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition ${
                  ativarBillingType === "PIX"
                    ? "border-yellow-500 bg-yellow-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                }`}
              >
                <span className="text-xl">⚡</span>
                <span className={`text-xs font-bold ${ativarBillingType === "PIX" ? "text-yellow-400" : "text-zinc-300"}`}>
                  PIX
                </span>
              </button>
              <button
                onClick={() => setAtivarBillingType("CREDIT_CARD")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition ${
                  ativarBillingType === "CREDIT_CARD"
                    ? "border-yellow-500 bg-yellow-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                }`}
              >
                <span className="text-xl">💳</span>
                <span className={`text-xs font-bold ${ativarBillingType === "CREDIT_CARD" ? "text-yellow-400" : "text-zinc-300"}`}>
                  Cartão de crédito
                </span>
              </button>
            </div>
          </div>

          {ativarError && (
            <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{ativarError}</p>
          )}

          <button
            onClick={handleAtivar}
            disabled={ativarLoading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-colors"
          >
            {ativarLoading ? "Gerando link de pagamento..." : "Ir para o pagamento"}
          </button>
        </div>
      )}

      {/* Cancelar assinatura */}
      {!cancelado && data.planoAtivo && !data.semAsaas && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-sm text-zinc-300 mb-1">Cancelar assinatura</h2>
          <p className="text-xs text-zinc-500 mb-4">
            Você pode cancelar a qualquer momento, sem fidelidade. Se já pagou o mês atual, seu
            acesso continuará até o final do período contratado.
          </p>
          <button
            onClick={() => { setShowCancelModal(true); setCancelError(null); setMotivoSelecionado(""); }}
            className="px-4 py-2 text-sm font-bold text-red-400 border border-red-400/40 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            Cancelar assinatura
          </button>
        </div>
      )}

      {/* Modal cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-5">
            <div>
              <h2 className="font-black text-lg">Cancelar assinatura</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Após o cancelamento, você mantém o acesso até{" "}
                <strong className="text-white">
                  {data.planoFim ? formatDate(data.planoFim) : "o fim do período atual"}
                </strong>
                . A próxima mensalidade não será cobrada.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-300">
                Motivo do cancelamento <span className="text-red-400">*</span>
              </p>
              <div className="relative">
                <select
                  value={motivoSelecionado}
                  onChange={(e) => setMotivoSelecionado(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-yellow-500 transition-colors"
                >
                  <option value="">Selecione um motivo...</option>
                  {MOTIVOS_CANCELAMENTO.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {cancelError && (
              <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{cancelError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelar}
                disabled={cancelLoading || !motivoSelecionado}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors"
              >
                {cancelLoading ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
