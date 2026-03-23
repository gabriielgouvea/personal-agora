"use client";

import { DollarSign } from "lucide-react";

export default function FaturamentoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Faturamento</h2>
        <p className="text-zinc-500 text-sm mt-1">Acompanhe a receita da plataforma</p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Faturamento Total</span>
            <DollarSign size={18} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold">R$ 0,00</div>
          <p className="text-xs text-zinc-500 mt-1">Acumulado</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Este Mês</span>
            <DollarSign size={18} className="text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">R$ 0,00</div>
          <p className="text-xs text-zinc-500 mt-1">{new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Mês Anterior</span>
            <DollarSign size={18} className="text-zinc-500" />
          </div>
          <div className="text-2xl font-bold">R$ 0,00</div>
          <p className="text-xs text-zinc-500 mt-1">—</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center">
        <DollarSign size={48} className="mx-auto text-zinc-700 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-300 mb-2">Módulo de Faturamento</h3>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          Quando o sistema de pagamentos estiver integrado, aqui você verá o faturamento detalhado com filtros por data, tipo de transação e relatórios exportáveis.
        </p>
      </div>
    </div>
  );
}
