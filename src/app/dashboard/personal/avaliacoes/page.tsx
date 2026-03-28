"use client";

import { useEffect, useState } from "react";
import { Star, Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";

interface Avaliacao {
  id: string;
  nota: number;
  comentario: string | null;
  visivelNoPerfil: boolean;
  createdAt: string;
  autor: {
    nome: string;
    sobrenome: string;
    avatarUrl: string | null;
  };
}

export default function AvaliacoesPersonalPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/avaliacoes/minhas")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAvaliacoes(data.avaliacoes ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function toggleVisibilidade(id: string, atual: boolean) {
    setToggling(id);
    const res = await fetch(`/api/avaliacoes/${id}/visibilidade`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visivelNoPerfil: !atual }),
    });
    if (res.ok) {
      setAvaliacoes((prev) =>
        prev.map((a) => (a.id === id ? { ...a, visivelNoPerfil: !atual } : a))
      );
    }
    setToggling(null);
  }

  const media =
    avaliacoes.length > 0
      ? avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length
      : 0;
  const visiveis = avaliacoes.filter((a) => a.visivelNoPerfil).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black mb-2">Avaliações Recebidas</h1>
      <p className="text-zinc-500 text-sm mb-8">
        Gerencie quais avaliações aparecem no seu perfil público para outros alunos.
      </p>

      {avaliacoes.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <MessageSquare className="w-12 h-12 text-zinc-700" />
          <p className="text-zinc-400 font-medium">Nenhuma avaliação recebida ainda.</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Quando um aluno avaliar uma aula com você, a avaliação aparecerá aqui.
          </p>
        </div>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">Nota média</p>
              <div className="flex items-center justify-center gap-1.5">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-black text-yellow-400">{media.toFixed(1)}</span>
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">Total</p>
              <p className="text-2xl font-black text-white">{avaliacoes.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">Visíveis no perfil</p>
              <p className="text-2xl font-black text-green-400">{visiveis}</p>
            </div>
          </div>

          {/* Lista de avaliações */}
          <div className="flex flex-col gap-3">
            {avaliacoes.map((av) => {
              const initials = av.autor.nome[0].toUpperCase();
              return (
                <div
                  key={av.id}
                  className={`bg-zinc-900 border rounded-2xl p-5 transition ${
                    av.visivelNoPerfil ? "border-zinc-800" : "border-zinc-800 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {av.autor.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={av.autor.avatarUrl} alt={av.autor.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-yellow-500 text-sm">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{av.autor.nome} {av.autor.sobrenome}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`w-3.5 h-3.5 ${av.nota >= n ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-zinc-600">
                          {new Date(av.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {av.comentario && (
                        <p className="text-sm text-zinc-400 mb-2">{av.comentario}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleVisibilidade(av.id, av.visivelNoPerfil)}
                      disabled={toggling === av.id}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 shrink-0 ${
                        av.visivelNoPerfil
                          ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {toggling === av.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : av.visivelNoPerfil ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      {av.visivelNoPerfil ? "Visível" : "Oculta"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
