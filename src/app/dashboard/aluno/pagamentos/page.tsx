"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  QrCode,
  CalendarDays,
  DollarSign,
  Loader2,
  Receipt,
} from "lucide-react";

interface Aula {
  id: string;
  valor: number;
  status: string;
  formaPagamento: string | null;
  paidAt: string | null;
  createdAt: string;
  personal: {
    nome: string;
    sobrenome: string;
  };
}

const FORMA_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  PIX: { label: "PIX", icon: QrCode },
  CREDIT_CARD: { label: "Cartão de Crédito", icon: CreditCard },
  BOLETO: { label: "Boleto", icon: Receipt },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paga: { label: "Pago", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  confirmada: { label: "Confirmado", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  cancelada: { label: "Cancelado", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  reembolsada: { label: "Reembolsado", color: "text-zinc-400 bg-zinc-800 border-zinc-700" },
  aguardando_pagamento: { label: "Pendente", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" },
};

export default function PagamentosAlunoPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/aulas")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAulas)
      .finally(() => setLoading(false));
  }, []);

  const pagos = aulas.filter((a) => a.status === "paga" || a.status === "confirmada");
  const totalGasto = pagos.reduce((s, a) => s + a.valor, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black mb-2">Histórico de Pagamentos</h1>
      <p className="text-zinc-500 text-sm mb-6">Todos os pagamentos realizados pela plataforma.</p>

      {/* Resumo */}
      {aulas.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Total gasto</p>
            <p className="text-xl font-black text-yellow-400">
              R$ {totalGasto.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Aulas pagas</p>
            <p className="text-xl font-black text-white">{pagos.length}</p>
          </div>
        </div>
      )}

      {aulas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <DollarSign className="w-12 h-12 text-zinc-700" />
          <p className="text-zinc-400 font-medium">Nenhum pagamento realizado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {aulas.map((aula) => {
            const s = STATUS_LABELS[aula.status] ?? STATUS_LABELS.aguardando_pagamento;
            const forma = aula.formaPagamento ? FORMA_LABELS[aula.formaPagamento] : null;
            const FormaIcon = forma?.icon ?? DollarSign;
            const dataRef = aula.paidAt || aula.createdAt;

            return (
              <div key={aula.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  {/* Ícone da forma de pagamento */}
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <FormaIcon className="w-5 h-5 text-yellow-500" />
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">
                      Aula com {aula.personal.nome} {aula.personal.sobrenome}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(dataRef).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        {" às "}
                        {new Date(dataRef).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {forma && (
                        <span className="text-xs text-zinc-500">• {forma.label}</span>
                      )}
                    </div>
                  </div>

                  {/* Valor + Status */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-yellow-400">
                      R$ {aula.valor.toFixed(2).replace(".", ",")}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
