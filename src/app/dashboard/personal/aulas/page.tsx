"use client";

import { useEffect, useState } from "react";
import { MessageCircle, CheckCircle2, Clock, XCircle, RefreshCw, CalendarDays, BadgeDollarSign, User, Star, Loader2, Flag, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Aula {
  id: string;
  valor: number;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
  jaAvaliou: boolean;
  aluno: {
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
  paga: { label: "Paga — aguardando sua aceitação", color: "text-orange-400 bg-orange-500/10 border-orange-500/30", icon: Clock },
  aceita: { label: "Aceita — aguardando confirmação do aluno", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: CheckCircle2 },
  confirmada: { label: "Confirmada — pagamento liberado", color: "text-green-400 bg-green-500/10 border-green-500/30", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle },
  reembolsada: { label: "Reembolsada", color: "text-zinc-400 bg-zinc-800 border-zinc-700", icon: RefreshCw },
};

export default function AulasPersonalPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [avaliarAulaId, setAvaliarAulaId] = useState<string | null>(null);
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<{ id: string; msg: string; tipo: "ok" | "aviso" | "suspensao" } | null>(null);
  const [aceitando, setAceitando] = useState<string | null>(null);
  const [aceitarMsg, setAceitarMsg] = useState<{ id: string; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/aulas")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAulas)
      .finally(() => setLoading(false));
  }, []);

  async function enviarAvaliacao() {
    if (!avaliarAulaId || nota === 0) return;
    setEnviandoAvaliacao(true);
    const res = await fetch("/api/avaliacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aulaId: avaliarAulaId, nota, comentario: comentario.trim() || undefined }),
    });
    if (res.ok) {
      setAulas((prev) => prev.map((a) => (a.id === avaliarAulaId ? { ...a, jaAvaliou: true } : a)));
      setAvaliarAulaId(null);
      setNota(0);
      setComentario("");
    }
    setEnviandoAvaliacao(false);
  }

  async function cancelarAula(aulaId: string) {
    if (!confirm("Tem certeza que deseja cancelar esta aula? Se faltar menos de 12h, voc\u00ea receber\u00e1 uma advert\u00eancia.")) return;
    setCancelando(aulaId);
    try {
      const res = await fetch(`/api/aulas/${aulaId}/cancelar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setAulas((prev) =>
          prev.map((a) => (a.id === aulaId ? { ...a, status: data.status } : a))
        );
        setCancelMsg({
          id: aulaId,
          msg: data.mensagem,
          tipo: data.suspenso ? "suspensao" : data.tardio ? "aviso" : "ok",
        });
      }
    } catch {
      setCancelMsg({ id: aulaId, msg: "Erro ao cancelar. Tente novamente.", tipo: "aviso" });
    }
    setCancelando(null);
  }

  async function aceitarAula(aulaId: string) {
    const confirmar = confirm(
      "Ao aceitar esta aula, você se compromete a realizá-la.\n\n" +
      "⚠️ Lembre-se:\n" +
      "• Cancelar com menos de 12h gera advertência\n" +
      "• 3 advertências em 30 dias = suspensão da conta\n" +
      "• Manter sua reputação garante mais alunos\n\n" +
      "Deseja aceitar esta aula?"
    );
    if (!confirmar) return;

    setAceitando(aulaId);
    try {
      const res = await fetch(`/api/aulas/${aulaId}/aceitar`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setAulas((prev) =>
          prev.map((a) => (a.id === aulaId ? { ...a, status: "aceita" } : a))
        );
        setAceitarMsg({
          id: aulaId,
          msg: data.advertencias > 0
            ? `Aula aceita! Atenção: você tem ${data.advertencias} advertência(s) nos últimos 30 dias. Mantenha sua reputação!`
            : "Aula aceita com sucesso! O aluno foi notificado.",
        });
      }
    } catch {
      setAceitarMsg({ id: aulaId, msg: "Erro ao aceitar. Tente novamente." });
    }
    setAceitando(null);
  }

  const totalPago = aulas
    .filter((a) => a.status === "paga" || a.status === "confirmada")
    .reduce((s, a) => s + a.valor, 0);

  const totalLiberado = aulas
    .filter((a) => a.status === "confirmada")
    .reduce((s, a) => s + a.valor, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black mb-2">Aulas Agendadas</h1>
      <p className="text-zinc-500 text-sm mb-6">Alunos que contrataram aulas com você pela plataforma.</p>

      {/* Resumo financeiro */}
      {aulas.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 mb-1">A receber (pendente)</p>
            <p className="text-xl font-black text-yellow-400">
              R$ {(totalPago - totalLiberado).toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Já liberado</p>
            <p className="text-xl font-black text-green-400">
              R$ {totalLiberado.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      )}

      {aulas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <CalendarDays className="w-12 h-12 text-zinc-700" />
          <p className="text-zinc-400 font-medium">Nenhuma aula agendada ainda.</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Quando um aluno contratar uma aula com você pela plataforma, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {aulas.map((aula) => {
            const s = STATUS_LABELS[aula.status] ?? STATUS_LABELS.aguardando_pagamento;
            const StatusIcon = s.icon;
            const initials = aula.aluno.nome[0].toUpperCase();
            const whatsappUrl = aula.aluno.isWhatsapp && aula.aluno.telefone
              ? `https://wa.me/55${aula.aluno.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${aula.aluno.nome}! Sou seu personal pelo Personal Agora. Vamos combinar os detalhes da aula?`)}`
              : null;

            return (
              <div key={aula.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {aula.aluno.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={aula.aluno.avatarUrl} alt={aula.aluno.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-yellow-500">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{aula.aluno.nome} {aula.aluno.sobrenome}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(aula.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-yellow-400">
                        R$ {aula.valor.toFixed(2).replace(".", ",")}
                      </p>
                      {aula.status === "confirmada" && (
                        <p className="text-xs text-green-400 flex items-center gap-1 justify-end mt-0.5">
                          <BadgeDollarSign className="w-3 h-3" /> Liberado
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${s.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {s.label}
                  </div>
                </div>

                {/* Ações visíveis após pagamento */}
                {(aula.status === "paga" || aula.status === "aceita" || aula.status === "confirmada") && (
                  <div className="border-t border-zinc-800 px-5 py-4 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-3">
                    {aula.status === "paga" && (
                      <button
                        onClick={() => aceitarAula(aula.id)}
                        disabled={aceitando === aula.id}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-60"
                      >
                        {aceitando === aula.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Aceitar aula
                      </button>
                    )}
                    <Link
                      href={`/dashboard/personal/aluno/${aula.aluno.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-xl transition"
                    >
                      <User className="w-4 h-4" />
                      Ver perfil
                    </Link>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp do aluno
                      </a>
                    )}
                    {aula.status === "confirmada" && !aula.jaAvaliou && avaliarAulaId !== aula.id && (
                      <button
                        onClick={() => { setAvaliarAulaId(aula.id); setNota(0); setComentario(""); }}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-xl transition flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Avaliar aluno
                      </button>
                    )}
                    {aula.status === "confirmada" && aula.jaAvaliou && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Avaliado
                      </span>
                    )}
                    {(aula.status === "paga" || aula.status === "aceita") && (
                      <button
                        onClick={() => cancelarAula(aula.id)}
                        disabled={cancelando === aula.id}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl transition flex items-center gap-2 disabled:opacity-60"
                      >
                        {cancelando === aula.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Cancelar aula
                      </button>
                    )}
                    </div>

                    {aceitarMsg && aceitarMsg.id === aula.id && (
                      <div className="p-3 rounded-xl text-sm flex items-start gap-2 bg-green-500/10 border border-green-500/30 text-green-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        {aceitarMsg.msg}
                      </div>
                    )}

                    {cancelMsg && cancelMsg.id === aula.id && (
                      <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${
                        cancelMsg.tipo === "suspensao"
                          ? "bg-red-500/10 border border-red-500/30 text-red-300"
                          : cancelMsg.tipo === "aviso"
                            ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-300"
                            : "bg-green-500/10 border border-green-500/30 text-green-300"
                      }`}>
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {cancelMsg.msg}
                      </div>
                    )}

                    {/* Formulário de avaliação inline */}
                    {avaliarAulaId === aula.id && (
                      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                        <p className="text-sm font-semibold mb-3">Como foi sua aula com {aula.aluno.nome}?</p>
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onMouseEnter={() => setHoverNota(n)}
                              onMouseLeave={() => setHoverNota(0)}
                              onClick={() => setNota(n)}
                              className="p-0.5 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-7 h-7 ${(hoverNota || nota) >= n ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"}`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder="Deixe um comentário (opcional)"
                          rows={2}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50 resize-none mb-3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={enviarAvaliacao}
                            disabled={nota === 0 || enviandoAvaliacao}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                          >
                            {enviandoAvaliacao && <Loader2 className="w-4 h-4 animate-spin" />}
                            Enviar avaliação
                          </button>
                          <button
                            onClick={() => setAvaliarAulaId(null)}
                            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-xl transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {aula.status === "paga" && (
                      <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        Aceite a aula para confirmar o agendamento. Cancelar com menos de 12h gera advertência.
                      </div>
                    )}

                    <a
                      href={`/dashboard/relatar?aulaId=${aula.id}&relatadoId=${aula.aluno.id}&nome=${encodeURIComponent(aula.aluno.nome + " " + aula.aluno.sobrenome)}&volta=/dashboard/personal/aulas`}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition mt-1"
                    >
                      <Flag className="w-3 h-3" />
                      Relatar um problema
                    </a>
                  </div>
                )}
                {/* Relatar — aparece para todos os status */}
                {!(aula.status === "paga" || aula.status === "aceita" || aula.status === "confirmada") && (
                  <div className="border-t border-zinc-800 px-5 py-3">
                    <a
                      href={`/dashboard/relatar?aulaId=${aula.id}&relatadoId=${aula.aluno.id}&nome=${encodeURIComponent(aula.aluno.nome + " " + aula.aluno.sobrenome)}&volta=/dashboard/personal/aulas`}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition"
                    >
                      <Flag className="w-3 h-3" />
                      Relatar um problema
                    </a>
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
