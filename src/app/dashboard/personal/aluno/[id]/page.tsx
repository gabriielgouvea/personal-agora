"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  User,
  Dumbbell,
  Clock,
  Heart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageCircle,
  CalendarDays,
  Shield,
  Star,
} from "lucide-react";

interface AulaHistorico {
  id: string;
  valor: number;
  status: string;
  formaPagamento: string | null;
  paidAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

interface AlunoProfile {
  id: string;
  nome: string;
  sobrenome: string;
  avatarUrl: string | null;
  telefone: string | null;
  isWhatsapp: boolean;
  email: string;
  dataNascimento: string | null;
  sexo: string | null;
  esportes: string | null;
  academias: string | null;
  temWellhub: boolean;
  temTotalPass: boolean;
  experiencia: string | null;
  tempoTreino: string | null;
  parqRespostas: string | null;
  parqPreenchidoEm: string | null;
  isPCD: boolean;
  tipoDeficiencia: string | null;
  createdAt: string;
  aulas: AulaHistorico[];
}

const PARQ_PERGUNTAS = [
  "Problema de coração (atividade supervisionada)?",
  "Dor no peito durante atividade física?",
  "Dor no peito no último mês?",
  "Tontura ou perda de consciência?",
  "Problema ósseo ou articular?",
  "Medicamento para pressão/coração?",
  "Outra razão para não praticar atividade física?",
];

const EXP_LABELS: Record<string, string> = {
  iniciante: "Iniciante (começando agora)",
  ja_treino: "Já treina",
};

const TEMPO_LABELS: Record<string, string> = {
  menos_6: "Menos de 6 meses",
  "6_12": "6 meses a 1 ano",
  "1_2": "1 a 2 anos",
  "2_5": "2 a 5 anos",
  mais_5: "Mais de 5 anos",
};

const STATUS_COLORS: Record<string, string> = {
  paga: "text-blue-400",
  confirmada: "text-green-400",
  cancelada: "text-red-400",
  reembolsada: "text-zinc-400",
  aguardando_pagamento: "text-yellow-500",
};

const STATUS_LABELS: Record<string, string> = {
  paga: "Paga",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  reembolsada: "Reembolsada",
  aguardando_pagamento: "Aguardando",
};

function calcularIdade(dataNasc: string): number | null {
  const parts = dataNasc.split("/");
  if (parts.length !== 3) return null;
  const birth = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PerfilAlunoPage() {
  const { id } = useParams();
  const [aluno, setAluno] = useState<AlunoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avaliacoes, setAvaliacoes] = useState<{
    avaliacoes: { id: string; nota: number; comentario: string | null; createdAt: string; autor: { nome: string; avatarUrl: string | null } }[];
    media: number;
    total: number;
  }>({ avaliacoes: [], media: 0, total: 0 });

  useEffect(() => {
    fetch(`/api/alunos/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Sem permissão ou aluno não encontrado");
        return r.json();
      })
      .then(setAluno)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // Busca avaliações do aluno (visível para personais)
    fetch(`/api/avaliacoes/aluno/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setAvaliacoes(data); })
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error || !aluno) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard/personal/aulas" className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error || "Aluno não encontrado"}
        </div>
      </div>
    );
  }

  const idade = aluno.dataNascimento ? calcularIdade(aluno.dataNascimento) : null;
  const esportes: string[] = aluno.esportes ? (() => { try { return JSON.parse(aluno.esportes); } catch { return []; } })() : [];
  const academias: string[] = aluno.academias ? (() => { try { return JSON.parse(aluno.academias); } catch { return []; } })() : [];
  const parqRespostas: Record<number, boolean> = aluno.parqRespostas ? (() => { try { return JSON.parse(aluno.parqRespostas); } catch { return {}; } })() : {};
  const initials = `${aluno.nome[0]}${aluno.sobrenome[0]}`.toUpperCase();

  const whatsappUrl = aluno.isWhatsapp && aluno.telefone
    ? `https://wa.me/55${aluno.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${aluno.nome}! Sou seu personal pelo Personal Agora.`)}`
    : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dashboard/personal/aulas" className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Voltar às aulas
      </Link>

      {/* Header do aluno */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border-2 border-zinc-700">
          {aluno.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={aluno.avatarUrl} alt={aluno.nome} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-black text-yellow-500">{initials}</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black">{aluno.nome} {aluno.sobrenome}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 mt-1">
            {idade !== null && <span>{idade} anos</span>}
            {aluno.sexo && <span>• {aluno.sexo === "masculino" ? "Masculino" : aluno.sexo === "feminino" ? "Feminino" : "Outro"}</span>}
            <span>• Desde {new Date(aluno.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</span>
          </div>
        </div>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        )}
      </div>

      {/* PCD */}
      {aluno.isPCD && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">
            PCD {aluno.tipoDeficiencia ? `— ${aluno.tipoDeficiencia}` : ""}
          </span>
        </div>
      )}

      {/* Perfil de treino */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-yellow-500" /> Perfil de Treino
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          {esportes.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-1.5">Modalidades</p>
              <div className="flex flex-wrap gap-2">
                {esportes.map((e) => (
                  <span key={e} className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full border border-yellow-500/20">{e}</span>
                ))}
              </div>
            </div>
          )}
          {academias.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-1.5">Academias</p>
              <div className="flex flex-wrap gap-2">
                {academias.map((a) => (
                  <span key={a} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-full border border-zinc-700">{a}</span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {aluno.experiencia && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Experiência</p>
                <p className="text-sm text-white font-medium">{EXP_LABELS[aluno.experiencia] ?? aluno.experiencia}</p>
              </div>
            )}
            {aluno.tempoTreino && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Tempo de treino</p>
                <p className="text-sm text-white font-medium">{TEMPO_LABELS[aluno.tempoTreino] ?? aluno.tempoTreino}</p>
              </div>
            )}
          </div>
          {(aluno.temWellhub || aluno.temTotalPass) && (
            <div>
              <p className="text-xs text-zinc-500 mb-1.5">Benefícios</p>
              <div className="flex gap-3">
                {aluno.temWellhub && <span className="text-xs text-zinc-300">✓ Wellhub (Gympass)</span>}
                {aluno.temTotalPass && <span className="text-xs text-zinc-300">✓ TotalPass</span>}
              </div>
            </div>
          )}
          {!aluno.experiencia && esportes.length === 0 && (
            <p className="text-xs text-zinc-500 italic">Aluno ainda não preencheu o perfil de treino.</p>
          )}
        </div>
      </section>

      {/* PAR-Q */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-yellow-500" /> Saúde (PAR-Q)
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          {aluno.parqPreenchidoEm ? (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 mb-3">
                Preenchido em {new Date(aluno.parqPreenchidoEm).toLocaleDateString("pt-BR")}
              </p>
              {PARQ_PERGUNTAS.map((p, i) => {
                const resp = parqRespostas[i];
                return (
                  <div key={i} className="flex items-start gap-3">
                    {resp === true ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    ) : resp === false ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs text-zinc-300">{p}</p>
                      <p className={`text-xs font-bold ${resp === true ? "text-yellow-400" : "text-green-400"}`}>
                        {resp === true ? "Sim" : resp === false ? "Não" : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
              {Object.values(parqRespostas).some((v) => v === true) && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300">
                    Atenção: o aluno respondeu &quot;Sim&quot; a uma ou mais perguntas. Avalie cuidadosamente antes de iniciar as atividades.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">Aluno ainda não preencheu o questionário PAR-Q.</p>
          )}
        </div>
      </section>

      {/* Avaliações de personais sobre este aluno */}
      {avaliacoes.total > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> Avaliações de Personais ({avaliacoes.total})
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800">
              <span className="text-2xl font-black text-yellow-400">{avaliacoes.media.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${avaliacoes.media >= n ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500">{avaliacoes.total} avaliação{avaliacoes.total !== 1 ? "ões" : ""}</span>
            </div>
            <div className="space-y-3">
              {avaliacoes.avaliacoes.map((av) => (
                <div key={av.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {av.autor.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={av.autor.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-yellow-500">{av.autor.nome[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">{av.autor.nome}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`w-3 h-3 ${av.nota >= n ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-600">{new Date(av.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {av.comentario && <p className="text-sm text-zinc-400">{av.comentario}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Histórico de aulas entre ambos */}
      <section>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-yellow-500" /> Histórico de Aulas ({aluno.aulas.length})
        </h2>
        {aluno.aulas.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhuma aula registrada.</p>
        ) : (
          <div className="space-y-2">
            {aluno.aulas.map((aula) => (
              <div key={aula.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    {new Date(aula.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    <span className="text-zinc-500 ml-2 text-xs">
                      {new Date(aula.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </p>
                  <p className={`text-xs font-semibold ${STATUS_COLORS[aula.status] ?? "text-zinc-400"}`}>
                    {STATUS_LABELS[aula.status] ?? aula.status}
                  </p>
                </div>
                <p className="text-lg font-black text-yellow-400">
                  R$ {aula.valor.toFixed(2).replace(".", ",")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
