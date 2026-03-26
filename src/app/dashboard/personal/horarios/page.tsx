"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, AlertTriangle } from "lucide-react";

const DIAS_SEMANA = [
  { key: "seg", label: "Segunda-feira" },
  { key: "ter", label: "Terça-feira" },
  { key: "qua", label: "Quarta-feira" },
  { key: "qui", label: "Quinta-feira" },
  { key: "sex", label: "Sexta-feira" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
] as const;

const HORARIOS = [
  "05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00",
];

type Disponibilidade = Record<string, string[]>;

export default function HorariosPage() {
  const [disp, setDisp] = useState<Disponibilidade>({
    seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.disponibilidade) {
          try {
            const parsed = JSON.parse(data.disponibilidade);
            setDisp((prev) => ({ ...prev, ...parsed }));
          } catch { /* ignore */ }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggleHorario(dia: string, horario: string) {
    setSaved(false);
    setDisp((prev) => {
      const cur = prev[dia] || [];
      return {
        ...prev,
        [dia]: cur.includes(horario)
          ? cur.filter((h) => h !== horario)
          : [...cur, horario].sort(),
      };
    });
  }

  function toggleDia(dia: string) {
    setSaved(false);
    setDisp((prev) => {
      const cur = prev[dia] || [];
      return {
        ...prev,
        [dia]: cur.length === HORARIOS.length ? [] : [...HORARIOS],
      };
    });
  }

  function limparTudo() {
    setSaved(false);
    setDisp({ seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] });
  }

  async function salvar() {
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponibilidade: JSON.stringify(disp) }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  const totalSlots = Object.values(disp).reduce((sum, arr) => sum + arr.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black italic tracking-tight">
          Meus <span className="text-yellow-500">Horários</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Selecione os dias e horários em que você está disponível para atender alunos.
        </p>
      </div>

      {/* Aviso */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 text-sm font-medium">Mantenha seus horários atualizados!</p>
          <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
            Quando um aluno buscar um dia ou horário específico, só aparecerão os personais com disponibilidade
            naquele momento. Se seus horários não estiverem atualizados, você <strong className="text-zinc-400">não aparecerá</strong> na busca do aluno.
            Você pode alterar quantas vezes precisar.
          </p>
        </div>
      </div>

      {/* Grid de horários */}
      <div className="space-y-3">
        {DIAS_SEMANA.map(({ key, label }) => {
          const selected = disp[key] || [];
          const allSelected = selected.length === HORARIOS.length;
          return (
            <div key={key} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600">
                    {selected.length} {selected.length === 1 ? "horário" : "horários"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDia(key)}
                    className={`text-xs px-3 py-1 rounded-lg transition ${
                      allSelected
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {allSelected ? "Limpar dia" : "Selecionar todos"}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {HORARIOS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleHorario(key, h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selected.includes(h)
                        ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-500"
                        : "bg-zinc-800 border border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            onClick={salvar}
            disabled={saving}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saved ? "Salvo!" : "Salvar Horários"}
          </button>
          <button
            type="button"
            onClick={limparTudo}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition"
          >
            Limpar tudo
          </button>
        </div>
        <span className="text-xs text-zinc-600">
          {totalSlots} {totalSlots === 1 ? "horário selecionado" : "horários selecionados"}
        </span>
      </div>
    </div>
  );
}
