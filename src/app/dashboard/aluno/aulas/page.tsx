"use client";

import { useEffect, useState } from "react";
import { MessageCircle, CheckCircle2, Clock, XCircle, RefreshCw, Loader2, CalendarDays, AlertCircle } from "lucide-react";

interface Aula {
  id: string;
  valor: number;
  status: string;
  paymentUrl: string | null;
  confirmedAt: string | null;
  createdAt: string;
  personal: {
    id: string;
    nome: string;
    sobrenome: string;
    avatarUrl: string | null;
    telefone: string | null;
    isWhatsapp: boolean;
    email: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  aguardando_pagamento: { label: "Aguardando pagamento", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", icon: Clock },
  paga: { label: "Paga — aguardando confirmação", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: CheckCircle2 },
  confirmada: { label: "Confirmada ✓", color: "text-green-400 bg-green-500/10 border-green-500/30", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle },
  reembolsada: { label: "Reembolsada", color: "text-zinc-400 bg-zinc-800 border-zinc-700", icon: RefreshCw },
};

export default function MinhasAulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  async function fetchAulas() {
    const res = await fetch("/api/aulas");
    if (res.ok) setAulas(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAulas(); }, []);

  async function confirmarAula(aulaId: string) {
    if (!confirm("Confirmar que a aula foi realizada? O pagamento será liberado ao personal.")) return;
    setConfirming(aulaId);
    const res = await fetch(`/api/aulas/${aulaId}/confirmar`, { method: "PATCH" });
    if (res.ok) {
      setAulas((prev) =>
        prev.map((a) => (a.id === aulaId ? { ...a, status: "confirmada", confirmedAt: new Date().toISOString() } : a))
      );
    }
    setConfirming(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black mb-2">Minhas Aulas</h1>
      <p className="text-zinc-500 text-sm mb-8">Histórico e status das suas aulas contratadas.</p>

      {aulas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <CalendarDays className="w-12 h-12 text-zinc-700" />
          <p className="text-zinc-400 font-medium">Você ainda não contratou nenhuma aula.</p>
          <a
            href="/dashboard/aluno/buscar"
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition"
          >
            Buscar Personais
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {aulas.map((aula) => {
            const s = STATUS_LABELS[aula.status] ?? STATUS_LABELS.aguardando_pagamento;
            const StatusIcon = s.icon;
            const initials = aula.personal.nome[0].toUpperCase();
            const whatsappUrl = aula.personal.isWhatsapp && aula.personal.telefone
              ? `https://wa.me/55${aula.personal.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${aula.personal.nome}! Vi sua confirmação de pagamento no Personal Agora.`)}`
              : null;

            return (
              <div key={aula.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {aula.personal.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={aula.personal.avatarUrl} alt={aula.personal.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-yellow-500">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{aula.personal.nome} {aula.personal.sobrenome}</p>
                      <p className="text-xs text-zinc-500">{new Date(aula.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </div>
                    <span className="text-xl font-black text-yellow-400">
                      R$ {aula.valor.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${s.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {s.label}
                  </div>
                </div>

                {/* Actions */}
                {(aula.status === "aguardando_pagamento" || aula.status === "paga" || aula.status === "confirmada") && (
                  <div className="border-t border-zinc-800 px-5 py-4 flex flex-wrap gap-3">
                    {aula.status === "aguardando_pagamento" && aula.paymentUrl && (
                      <a
                        href={aula.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-xl transition"
                      >
                        Pagar agora
                      </a>
                    )}
                    {aula.status === "paga" && (
                      <button
                        onClick={() => confirmarAula(aula.id)}
                        disabled={confirming === aula.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-60"
                      >
                        {confirming === aula.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Aula realizada — confirmar
                      </button>
                    )}
                    {(aula.status === "paga" || aula.status === "confirmada") && whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp do personal
                      </a>
                    )}
                    {aula.status === "paga" && (
                      <div className="w-full flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        Clique em "Aula realizada" após a aula ocorrer para liberar o pagamento ao personal. Em caso de não comparecimento, entre em contato com o suporte.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
