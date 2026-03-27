"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  Search,
  X,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

/* ── Academias placeholder ── */
const ACADEMIAS = [
  "Ironberg Alphaville",
  "Ironberg Barra Funda",
  "Ironberg São Caetano",
  "Ironberg Pinheiros",
  "Bluefit Alphaville",
  "Bluefit Barueri",
  "Smart Fit Alphaville",
  "Smart Fit Tamboré",
  "Bio Ritmo Alphaville",
  "Bodytech Alphaville",
  "Companhia Athletica Alphaville",
  "Runner Alphaville",
];

const ESPORTES = ["Musculação", "Mobilidade", "Treino Funcional"] as const;

/* ── PAR-Q perguntas ── */
const PARQ_PERGUNTAS = [
  "Algum médico já disse que você possui algum problema de coração e que só deveria realizar atividade física supervisionada por profissionais de saúde?",
  "Você sente dores no peito quando pratica atividade física?",
  "No último mês, você sentiu dores no peito quando praticava atividade física?",
  "Você apresenta desequilíbrio devido à tontura e/ou perda de consciência (desmaio)?",
  "Você possui algum problema ósseo ou articular (ex: coluna, joelho, ombro) que poderia ser piorado pela atividade física?",
  "Você toma atualmente algum medicamento para pressão arterial e/ou problema de coração?",
  "Sabe de alguma outra razão pela qual você não deve praticar atividade física?",
];

const inputCls =
  "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition";
const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";

interface UserData {
  esportes?: string;
  academias?: string;
  temWellhub?: boolean;
  temTotalPass?: boolean;
  experiencia?: string;
  tempoTreino?: string;
  parqRespostas?: string;
  parqPreenchidoEm?: string;
  isPCD?: boolean;
  tipoDeficiencia?: string;
}

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Perfil de treino
  const [esportes, setEsportes] = useState<string[]>([]);
  const [academias, setAcademias] = useState<string[]>([]);
  const [temWellhub, setTemWellhub] = useState(false);
  const [temTotalPass, setTemTotalPass] = useState(false);
  const [experiencia, setExperiencia] = useState("");
  const [tempoTreino, setTempoTreino] = useState("");

  // PAR-Q
  const [parqRespostas, setParqRespostas] = useState<Record<number, boolean>>({});
  const [parqJaPreenchido, setParqJaPreenchido] = useState(false);

  // PCD
  const [isPCD, setIsPCD] = useState(false);
  const [tipoDeficiencia, setTipoDeficiencia] = useState("");

  // Academia search
  const [acSearch, setAcSearch] = useState("");
  const [acOpen, setAcOpen] = useState(false);
  const acRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (acRef.current && !acRef.current.contains(e.target as Node)) setAcOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Carregar dados existentes
  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: UserData | null) => {
        if (!data) return;
        if (data.esportes) {
          try { setEsportes(JSON.parse(data.esportes)); } catch { /* */ }
        }
        if (data.academias) {
          try { setAcademias(JSON.parse(data.academias)); } catch { /* */ }
        }
        setTemWellhub(data.temWellhub ?? false);
        setTemTotalPass(data.temTotalPass ?? false);
        setExperiencia(data.experiencia ?? "");
        setTempoTreino(data.tempoTreino ?? "");
        setIsPCD(data.isPCD ?? false);
        setTipoDeficiencia(data.tipoDeficiencia ?? "");
        if (data.parqRespostas) {
          try {
            setParqRespostas(JSON.parse(data.parqRespostas));
            setParqJaPreenchido(true);
          } catch { /* */ }
        }
        if (data.parqPreenchidoEm) setParqJaPreenchido(true);
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleEsporte(e: string) {
    setEsportes((cur) => cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]);
  }

  function addAcademia(a: string) {
    if (!academias.includes(a)) setAcademias([...academias, a]);
    setAcSearch("");
    setAcOpen(false);
  }

  function removeAcademia(a: string) {
    setAcademias(academias.filter((x) => x !== a));
  }

  const filteredAc = ACADEMIAS.filter(
    (a) =>
      acSearch.length >= 2 &&
      a.toLowerCase().includes(acSearch.toLowerCase()) &&
      !academias.includes(a)
  );

  function setParqResposta(idx: number, val: boolean) {
    setParqRespostas((prev) => ({ ...prev, [idx]: val }));
  }

  const parqCompleto = PARQ_PERGUNTAS.every((_, i) => parqRespostas[i] !== undefined);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          esportes: JSON.stringify(esportes),
          academias: JSON.stringify(academias),
          temWellhub,
          temTotalPass,
          experiencia: experiencia || null,
          tempoTreino: tempoTreino || null,
          isPCD,
          tipoDeficiencia: isPCD ? tipoDeficiencia : null,
          ...(parqCompleto
            ? {
                parqRespostas: JSON.stringify(parqRespostas),
                parqPreenchidoEm: new Date().toISOString(),
              }
            : {}),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/dashboard/aluno"), 1500);
      }
    } catch { /* */ }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (saved) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-2xl text-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-black uppercase italic mb-2">Perfil atualizado!</h2>
        <p className="text-zinc-400 text-sm">Redirecionando para o painel...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl">
      <Link
        href="/dashboard/aluno"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao painel
      </Link>

      <h1 className="text-2xl font-black uppercase italic tracking-tight mb-1">
        Complete seu <span className="text-yellow-500">Perfil</span>
      </h1>
      <p className="text-zinc-500 text-sm mb-8">
        Preencha as informações abaixo para termos uma melhor experiência.
      </p>

      {/* ═══════ SEÇÃO 1 — Treino ═══════ */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          🏋️ Perfil de Treino
        </h2>
        <div className="space-y-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          {/* Esportes */}
          <div>
            <label className={labelCls}>Qual modalidade procura?</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {ESPORTES.map((e) => {
                const active = esportes.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEsporte(e)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                      active
                        ? "bg-yellow-500 text-black border-yellow-500"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-yellow-500/50"
                    }`}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academias */}
          <div ref={acRef}>
            <label className={labelCls}>Em qual academia você treina?</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={acSearch}
                onChange={(e) => {
                  setAcSearch(e.target.value);
                  setAcOpen(true);
                }}
                onFocus={() => setAcOpen(true)}
                className={`${inputCls} pl-10`}
                placeholder="Buscar academia..."
              />
              {acOpen && filteredAc.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                  {filteredAc.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => addAcademia(a)}
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 transition"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {academias.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {academias.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20"
                  >
                    {a}
                    <button type="button" onClick={() => removeAcademia(a)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Wellhub / TotalPass */}
          <div>
            <label className={labelCls}>Benefícios</label>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={temWellhub}
                  onChange={(e) => setTemWellhub(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                />
                <span className="text-sm text-zinc-300">Tenho Wellhub (Gympass)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={temTotalPass}
                  onChange={(e) => setTemTotalPass(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                />
                <span className="text-sm text-zinc-300">Tenho TotalPass</span>
              </label>
            </div>
          </div>

          {/* Experiência */}
          <div>
            <label className={labelCls}>Tempo de treino</label>
            <div className="flex flex-col gap-3 mt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={experiencia === "iniciante"}
                  onChange={() => setExperiencia("iniciante")}
                  className="w-4 h-4 accent-yellow-500"
                />
                <span className="text-sm text-zinc-300">Estou começando agora</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={experiencia === "ja_treino"}
                  onChange={() => setExperiencia("ja_treino")}
                  className="w-4 h-4 accent-yellow-500"
                />
                <span className="text-sm text-zinc-300">Já treino</span>
              </label>
            </div>
          </div>

          {experiencia === "ja_treino" && (
            <div>
              <label className={labelCls}>Há quanto tempo?</label>
              <select
                value={tempoTreino}
                onChange={(e) => setTempoTreino(e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">Selecione</option>
                <option value="menos_6">Menos de 6 meses</option>
                <option value="6_12">6 meses a 1 ano</option>
                <option value="1_2">1 a 2 anos</option>
                <option value="2_5">2 a 5 anos</option>
                <option value="mais_5">Mais de 5 anos</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ SEÇÃO 2 — PCD ═══════ */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          ♿ Acessibilidade
        </h2>
        <div className="space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div>
            <label className={labelCls}>Você é pessoa com deficiência (PCD)?</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={isPCD === true}
                  onChange={() => setIsPCD(true)}
                  className="w-4 h-4 accent-yellow-500"
                />
                <span className="text-sm text-zinc-300">Sim</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={isPCD === false}
                  onChange={() => setIsPCD(false)}
                  className="w-4 h-4 accent-yellow-500"
                />
                <span className="text-sm text-zinc-300">Não</span>
              </label>
            </div>
          </div>

          {isPCD && (
            <div>
              <label className={labelCls}>Qual a deficiência?</label>
              <input
                value={tipoDeficiencia}
                onChange={(e) => setTipoDeficiencia(e.target.value)}
                className={inputCls}
                placeholder="Ex: física, visual, auditiva..."
              />
            </div>
          )}
        </div>
      </section>

      {/* ═══════ SEÇÃO 3 — PAR-Q ═══════ */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-yellow-500" />
          Questionário PAR-Q
        </h2>
        <p className="text-zinc-500 text-xs mb-4">
          Questionário de Prontidão para Atividade Física — responda com sinceridade.
        </p>

        {parqJaPreenchido && Object.keys(parqRespostas).length === PARQ_PERGUNTAS.length && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">PAR-Q já preenchido — você pode atualizar se necessário.</span>
          </div>
        )}

        <div className="space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          {PARQ_PERGUNTAS.map((pergunta, idx) => (
            <div key={idx} className="pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
              <p className="text-sm text-zinc-300 mb-3">
                <span className="text-yellow-500 font-bold mr-1">{idx + 1}.</span>
                {pergunta}
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={parqRespostas[idx] === true}
                    onChange={() => setParqResposta(idx, true)}
                    className="w-4 h-4 accent-yellow-500"
                  />
                  <span className="text-sm text-zinc-400">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={parqRespostas[idx] === false}
                    onChange={() => setParqResposta(idx, false)}
                    className="w-4 h-4 accent-yellow-500"
                  />
                  <span className="text-sm text-zinc-400">Não</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {!parqCompleto && (
          <div className="flex items-center gap-2 mt-3">
            <AlertTriangle className="w-4 h-4 text-zinc-500" />
            <p className="text-xs text-zinc-500">Responda todas as perguntas para concluir o PAR-Q.</p>
          </div>
        )}
      </section>

      {/* ═══════ Salvar ═══════ */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Salvar Perfil
              <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
