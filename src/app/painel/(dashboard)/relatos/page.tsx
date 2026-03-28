"use client";

import { useEffect, useState } from "react";
import {
  Flag,
  Loader2,
  Clock,
  Search,
  CheckCircle2,
  Archive,
  AlertTriangle,
  Eye,
  ChevronDown,
} from "lucide-react";

const CATEGORIAS_LABEL: Record<string, string> = {
  nao_compareceu: "Não compareceu",
  assedio: "Assédio",
  comportamento_inadequado: "Comportamento inadequado",
  atraso_excessivo: "Atraso excessivo",
  cobranca_indevida: "Cobrança indevida",
  qualidade_servico: "Qualidade do serviço",
  discriminacao: "Discriminação",
  outro: "Outro",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", icon: Clock },
  em_analise: { label: "Em análise", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Search },
  resolvido: { label: "Resolvido", color: "text-green-400 bg-green-500/10 border-green-500/30", icon: CheckCircle2 },
  arquivado: { label: "Arquivado", color: "text-zinc-400 bg-zinc-800 border-zinc-700", icon: Archive },
};

const CATEGORIA_COLORS: Record<string, string> = {
  nao_compareceu: "bg-red-500/10 text-red-400 border-red-500/30",
  assedio: "bg-red-500/10 text-red-400 border-red-500/30",
  comportamento_inadequado: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  atraso_excessivo: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  cobranca_indevida: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  qualidade_servico: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  discriminacao: "bg-red-500/10 text-red-400 border-red-500/30",
  outro: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

interface Relato {
  id: string;
  categoria: string;
  descricao: string;
  status: string;
  respostaAdmin: string | null;
  createdAt: string;
  autor: { id: string; nome: string; sobrenome: string; email: string; tipo: string; avatarUrl: string | null };
  relatado: { id: string; nome: string; sobrenome: string; email: string; tipo: string; avatarUrl: string | null };
  aula: { id: string; valor: number; status: string; createdAt: string } | null;
}

export default function RelatosAdminPage() {
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [respostaTemp, setRespostaTemp] = useState("");

  async function fetchRelatos() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroStatus) params.set("status", filtroStatus);
    if (filtroCategoria) params.set("categoria", filtroCategoria);
    const res = await fetch(`/api/admin/relatos?${params}`);
    if (res.ok) setRelatos(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchRelatos(); }, [filtroStatus, filtroCategoria]); // eslint-disable-line react-hooks/exhaustive-deps

  async function atualizarRelato(id: string, status: string, respostaAdmin?: string) {
    setAtualizando(id);
    const res = await fetch(`/api/admin/relatos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(respostaAdmin !== undefined && { respostaAdmin }) }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRelatos((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status, respostaAdmin: updated.respostaAdmin } : r)));
    }
    setAtualizando(null);
  }

  const pendentes = relatos.filter((r) => r.status === "pendente").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Flag className="w-6 h-6 text-red-400" />
            Relatos e Denúncias
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {relatos.length} relato{relatos.length !== 1 ? "s" : ""}
            {pendentes > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
                {pendentes} pendente{pendentes !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_analise">Em análise</option>
          <option value="resolvido">Resolvido</option>
          <option value="arquivado">Arquivado</option>
        </select>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
        >
          <option value="">Todas as categorias</option>
          {Object.entries(CATEGORIAS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
        </div>
      ) : relatos.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <Flag className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">Nenhum relato encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {relatos.map((r) => {
            const st = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pendente;
            const StatusIcon = st.icon;
            const isOpen = expandido === r.id;

            return (
              <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => { setExpandido(isOpen ? null : r.id); setRespostaTemp(r.respostaAdmin || ""); }}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-zinc-800/50 transition"
                >
                  <div className="shrink-0">
                    <AlertTriangle className={`w-5 h-5 ${r.categoria === "assedio" || r.categoria === "discriminacao" ? "text-red-400" : "text-orange-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${CATEGORIA_COLORS[r.categoria] || CATEGORIA_COLORS.outro}`}>
                        {CATEGORIAS_LABEL[r.categoria] || r.categoria}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${st.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 truncate">
                      <span className="font-semibold text-white">{r.autor.nome} {r.autor.sobrenome}</span>
                      <span className="text-zinc-500"> ({r.autor.tipo}) → </span>
                      <span className="font-semibold text-white">{r.relatado.nome} {r.relatado.sobrenome}</span>
                      <span className="text-zinc-500"> ({r.relatado.tipo})</span>
                    </p>
                  </div>
                  <span className="text-xs text-zinc-600 shrink-0">
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Detalhes expandidos */}
                {isOpen && (
                  <div className="border-t border-zinc-800 p-5 space-y-4">
                    {/* Autor e Relatado */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-xs text-zinc-500 mb-1">Autor do relato</p>
                        <p className="text-sm font-semibold">{r.autor.nome} {r.autor.sobrenome}</p>
                        <p className="text-xs text-zinc-400">{r.autor.email}</p>
                        <p className="text-xs text-zinc-500 mt-1 capitalize">{r.autor.tipo}</p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-xs text-zinc-500 mb-1">Relatado</p>
                        <p className="text-sm font-semibold">{r.relatado.nome} {r.relatado.sobrenome}</p>
                        <p className="text-xs text-zinc-400">{r.relatado.email}</p>
                        <p className="text-xs text-zinc-500 mt-1 capitalize">{r.relatado.tipo}</p>
                      </div>
                    </div>

                    {/* Aula relacionada */}
                    {r.aula && (
                      <div className="bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3">
                        <Eye className="w-4 h-4 text-zinc-500" />
                        <div>
                          <p className="text-xs text-zinc-500">Aula relacionada</p>
                          <p className="text-sm">
                            R$ {r.aula.valor.toFixed(2).replace(".", ",")} · Status: <span className="font-semibold">{r.aula.status}</span> · {new Date(r.aula.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Descrição */}
                    <div>
                      <p className="text-xs text-zinc-500 mb-1 font-semibold">Descrição</p>
                      <p className="text-sm text-zinc-300 bg-zinc-800/50 rounded-xl p-3 whitespace-pre-wrap">{r.descricao}</p>
                    </div>

                    {/* Resposta admin */}
                    <div>
                      <p className="text-xs text-zinc-500 mb-1 font-semibold">Resposta do admin (interna)</p>
                      <textarea
                        value={respostaTemp}
                        onChange={(e) => setRespostaTemp(e.target.value)}
                        placeholder="Adicionar observação interna..."
                        rows={2}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50 resize-none"
                      />
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      {r.status !== "em_analise" && (
                        <button
                          onClick={() => atualizarRelato(r.id, "em_analise", respostaTemp || undefined)}
                          disabled={atualizando === r.id}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-500/30 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {atualizando === r.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          Em análise
                        </button>
                      )}
                      {r.status !== "resolvido" && (
                        <button
                          onClick={() => atualizarRelato(r.id, "resolvido", respostaTemp || undefined)}
                          disabled={atualizando === r.id}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-500/30 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {atualizando === r.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          Resolvido
                        </button>
                      )}
                      {r.status !== "arquivado" && (
                        <button
                          onClick={() => atualizarRelato(r.id, "arquivado", respostaTemp || undefined)}
                          disabled={atualizando === r.id}
                          className="px-3 py-1.5 bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg hover:bg-zinc-600 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {atualizando === r.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          Arquivar
                        </button>
                      )}
                      {r.status !== "pendente" && (
                        <button
                          onClick={() => atualizarRelato(r.id, "pendente", respostaTemp || undefined)}
                          disabled={atualizando === r.id}
                          className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-lg hover:bg-yellow-500/30 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {atualizando === r.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          Voltar para pendente
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
