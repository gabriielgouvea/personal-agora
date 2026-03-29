"use client";

import { useEffect, useState } from "react";
import { MessageCircle, CheckCircle2, Clock, XCircle, RefreshCw, Loader2, CalendarDays, AlertCircle, Star, Flag } from "lucide-react";

interface Aula {
  id: string;
  valor: number;
  status: string;
  paymentUrl: string | null;
  confirmedAt: string | null;
  createdAt: string;
  jaAvaliou: boolean;
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
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<{ id: string; msg: string; tipo: "ok" | "aviso" } | null>(null);
  const [avaliarAulaId, setAvaliarAulaId] = useState<string | null>(null);
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  async function fetchAulas() {
    const res = await fetch("/api/aulas");
    if (res.ok) setAulas(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAulas(); }, []);

  async function cancelarAula(aulaId: string) {
    const aula = aulas.find((a) => a.id === aulaId);
    const msg = aula?.status === "paga"
      ? "Tem certeza? Se faltar menos de 12h para a aula, ela será considerada realizada e não haverá reembolso."
      : "Deseja cancelar esta aula?";
    if (!confirm(msg)) return;
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
          tipo: data.tardio ? "aviso" : "ok",
        });
      }
    } catch {
      setCancelMsg({ id: aulaId, msg: "Erro ao cancelar. Tente novamente.", tipo: "aviso" });
    }
    setCancelando(null);
  }

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
                  <div className="border-t border-zinc-800 px-5 py-4 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-3">
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
                    {aula.status === "confirmada" && !aula.jaAvaliou && avaliarAulaId !== aula.id && (
                      <button
                        onClick={() => { setAvaliarAulaId(aula.id); setNota(0); setComentario(""); }}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-xl transition flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Avaliar personal
                      </button>
                    )}
                    {aula.status === "confirmada" && aula.jaAvaliou && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Avaliado
                      </span>
                    )}
                    {(aula.status === "aguardando_pagamento" || aula.status === "paga") && (
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

                    {cancelMsg && cancelMsg.id === aula.id && (
                      <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${
                        cancelMsg.tipo === "aviso"
                          ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-300"
                          : "bg-green-500/10 border border-green-500/30 text-green-300"
                      }`}>
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {cancelMsg.msg}
                      </div>
                    )}

                    <a
                      href={`/dashboard/relatar?aulaId=${aula.id}&relatadoId=${aula.personal.id}&nome=${encodeURIComponent(aula.personal.nome + " " + aula.personal.sobrenome)}&volta=/dashboard/aluno/aulas`}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition"
                    >
                      <Flag className="w-3 h-3" />
                      Relatar um problema
                    </a>

                    {/* Formulário de avaliação inline */}
                    {avaliarAulaId === aula.id && (
                      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                        <p className="text-sm font-semibold mb-3">Como foi sua aula com {aula.personal.nome}?</p>
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
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        Clique em "Aula realizada" após a aula ocorrer para liberar o pagamento ao personal. Em caso de não comparecimento, entre em contato com o suporte.
                      </div>
                    )}


                  </div>
                )}
                {/* Relatar para aulas canceladas/reembolsadas */}
                {(aula.status === "cancelada" || aula.status === "reembolsada") && (
                  <div className="border-t border-zinc-800 px-5 py-3">
                    <a
                      href={`/dashboard/relatar?aulaId=${aula.id}&relatadoId=${aula.personal.id}&nome=${encodeURIComponent(aula.personal.nome + " " + aula.personal.sobrenome)}&volta=/dashboard/aluno/aulas`}
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
