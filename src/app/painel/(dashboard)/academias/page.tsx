"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, Building2, Network, MapPin } from "lucide-react";

interface Rede {
  id: string;
  nome: string;
  _count?: { academias: number };
}

interface Academia {
  id: string;
  nome: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  redeId: string | null;
  rede: { id: string; nome: string } | null;
  createdAt: string;
}

interface EnderecoSuggestion {
  description: string;
  latitude: number;
  longitude: number;
}

export default function AcademiasPage() {
  const [tab, setTab] = useState<"academias" | "redes">("academias");

  // === REDES STATE ===
  const [redes, setRedes] = useState<Rede[]>([]);
  const [redeLoading, setRedeLoading] = useState(true);
  const [showRedeForm, setShowRedeForm] = useState(false);
  const [editRedeId, setEditRedeId] = useState<string | null>(null);
  const [redeNome, setRedeNome] = useState("");
  const [redeSaving, setRedeSaving] = useState(false);
  const [redeErro, setRedeErro] = useState("");

  // === ACADEMIAS STATE ===
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroRede, setFiltroRede] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [enderecoSuggestions, setEnderecoSuggestions] = useState<EnderecoSuggestion[]>([]);
  const [enderecoOpen, setEnderecoOpen] = useState(false);
  const enderecoTimer = useRef<NodeJS.Timeout | null>(null);
  const enderecoRef = useRef<HTMLDivElement>(null);
  const [redeId, setRedeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  // === FETCH ===
  async function fetchRedes() {
    setRedeLoading(true);
    const res = await fetch("/api/admin/redes");
    const data = await res.json();
    setRedes(data);
    setRedeLoading(false);
  }

  async function fetchAcademias() {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (filtroRede) params.set("redeId", filtroRede);
    const res = await fetch(`/api/admin/academias?${params}`);
    const data = await res.json();
    setAcademias(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchRedes();
  }, []);

  useEffect(() => {
    fetchAcademias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, filtroRede]);

  // Fechar dropdown endereço ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (enderecoRef.current && !enderecoRef.current.contains(e.target as Node)) {
        setEnderecoOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Buscar sugestões de endereço (Photon) com debounce
  function handleEnderecoChange(value: string) {
    setEndereco(value);
    setLatitude(null);
    setLongitude(null);
    if (enderecoTimer.current) clearTimeout(enderecoTimer.current);
    if (value.length < 3) {
      setEnderecoSuggestions([]);
      setEnderecoOpen(false);
      return;
    }
    enderecoTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/endereco?input=${encodeURIComponent(value)}`);
        const data: EnderecoSuggestion[] = await res.json();
        setEnderecoSuggestions(data);
        setEnderecoOpen(data.length > 0);
      } catch {
        setEnderecoSuggestions([]);
      }
    }, 400);
  }

  function selectEndereco(s: EnderecoSuggestion) {
    setEndereco(s.description);
    setLatitude(s.latitude);
    setLongitude(s.longitude);
    setEnderecoOpen(false);
    setEnderecoSuggestions([]);
  }

  // === REDE ACTIONS ===
  function openNewRede() {
    setEditRedeId(null);
    setRedeNome("");
    setRedeErro("");
    setShowRedeForm(true);
  }

  function openEditRede(r: Rede) {
    setEditRedeId(r.id);
    setRedeNome(r.nome);
    setRedeErro("");
    setShowRedeForm(true);
  }

  async function handleRedeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRedeErro("");
    setRedeSaving(true);

    const url = editRedeId ? `/api/admin/redes/${editRedeId}` : "/api/admin/redes";
    const method = editRedeId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: redeNome }),
    });

    if (!res.ok) {
      const data = await res.json();
      setRedeErro(data.error || "Erro ao salvar");
      setRedeSaving(false);
      return;
    }

    setRedeSaving(false);
    setShowRedeForm(false);
    fetchRedes();
    fetchAcademias();
  }

  async function handleDeleteRede(id: string, redeNomeStr: string) {
    if (!confirm(`Remover a rede "${redeNomeStr}"? As academias associadas ficarão sem rede.`)) return;
    const res = await fetch(`/api/admin/redes/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Erro ao remover"); return; }
    fetchRedes();
    fetchAcademias();
  }

  // === ACADEMIA ACTIONS ===
  function openNew() {
    setEditingId(null);
    setNome("");
    setEndereco("");
    setLatitude(null);
    setLongitude(null);
    setRedeId("");
    setErro("");
    setEnderecoSuggestions([]);
    setEnderecoOpen(false);
    setShowForm(true);
  }

  function openEdit(a: Academia) {
    setEditingId(a.id);
    setNome(a.nome);
    setEndereco(a.endereco);
    setLatitude(a.latitude);
    setLongitude(a.longitude);
    setRedeId(a.redeId || "");
    setErro("");
    setEnderecoSuggestions([]);
    setEnderecoOpen(false);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSaving(true);

    const url = editingId ? `/api/admin/academias/${editingId}` : "/api/admin/academias";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, endereco, redeId: redeId || null, latitude, longitude }),
    });

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao salvar");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    fetchAcademias();
  }

  async function handleDelete(id: string, academiaNome: string) {
    if (!confirm(`Remover a academia "${academiaNome}"?`)) return;
    const res = await fetch(`/api/admin/academias/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Erro ao remover"); return; }
    fetchAcademias();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Academias</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {academias.length} academia{academias.length !== 1 ? "s" : ""} · {redes.length} rede{redes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={tab === "academias" ? openNew : openNewRede}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition"
        >
          <Plus size={16} />
          {tab === "academias" ? "Nova Academia" : "Nova Rede"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("academias")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "academias" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          Academias
        </button>
        <button
          onClick={() => setTab("redes")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "redes" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          Redes
        </button>
      </div>

      {/* ===================== TAB ACADEMIAS ===================== */}
      {tab === "academias" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou endereço..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition"
              />
            </div>
            <select
              value={filtroRede}
              onChange={(e) => setFiltroRede(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="">Todas as redes</option>
              {redes.map((r) => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60 text-zinc-400">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Rede</th>
                  <th className="text-left p-3">Endereço</th>
                  <th className="text-left p-3">Cadastrado em</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto" />
                    </td>
                  </tr>
                ) : academias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      <Building2 size={32} className="mx-auto mb-2 text-zinc-700" />
                      Nenhuma academia encontrada.
                    </td>
                  </tr>
                ) : (
                  academias.map((a) => (
                    <tr key={a.id} className="border-t border-zinc-900 hover:bg-zinc-900/30">
                      <td className="p-3 font-medium flex items-center gap-2">
                        <Building2 size={16} className="text-purple-400" />
                        {a.nome}
                      </td>
                      <td className="p-3">
                        {a.rede ? (
                          <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                            {a.rede.nome}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 text-zinc-400">{a.endereco}</td>
                      <td className="p-3 text-zinc-500 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <button onClick={() => openEdit(a)} className="text-yellow-500 hover:text-yellow-400 transition" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(a.id, a.nome)} className="text-red-400 hover:text-red-300 transition" title="Remover">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===================== TAB REDES ===================== */}
      {tab === "redes" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/60 text-zinc-400">
              <tr>
                <th className="text-left p-3">Rede</th>
                <th className="text-left p-3">Academias</th>
                <th className="text-left p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {redeLoading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : redes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-zinc-500">
                    <Network size={32} className="mx-auto mb-2 text-zinc-700" />
                    Nenhuma rede cadastrada.
                  </td>
                </tr>
              ) : (
                redes.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-900 hover:bg-zinc-900/30">
                    <td className="p-3 font-medium flex items-center gap-2">
                      <Network size={16} className="text-purple-400" />
                      {r.nome}
                    </td>
                    <td className="p-3 text-zinc-400">
                      {r._count?.academias || 0} unidade{(r._count?.academias || 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <button onClick={() => openEditRede(r)} className="text-yellow-500 hover:text-yellow-400 transition" title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteRede(r.id, r.nome)} className="text-red-400 hover:text-red-300 transition" title="Remover">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================== MODAL ACADEMIA ===================== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="font-bold text-lg">{editingId ? "Editar Academia" : "Nova Academia"}</h3>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {erro && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{erro}</div>
              )}
              <div>
                <label className="text-xs text-zinc-500 uppercase">Nome da Academia</label>
                <input required value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                  placeholder="Ex: Smart Fit Alphaville" />
              </div>
              <div ref={enderecoRef}>
                <label className="text-xs text-zinc-500 uppercase">Endereço</label>
                <div className="relative">
                  <input required value={endereco} onChange={(e) => handleEnderecoChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                    placeholder="Digite o endereço e selecione..." />
                  {enderecoOpen && enderecoSuggestions.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                      {enderecoSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectEndereco(s)}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-700 transition flex items-center gap-2"
                        >
                          <MapPin size={14} className="text-yellow-500 shrink-0" />
                          <span>{s.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {latitude && longitude ? (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <MapPin size={12} /> Localização capturada
                  </p>
                ) : endereco.length >= 3 ? (
                  <p className="text-xs text-yellow-500 mt-1">Selecione um endereço da lista para capturar a localização</p>
                ) : null}
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase">Rede (opcional)</label>
                <select
                  value={redeId}
                  onChange={(e) => setRedeId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                >
                  <option value="">Sem rede (academia independente)</option>
                  {redes.map((r) => (
                    <option key={r.id} value={r.id}>{r.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                  {saving ? "Salvando..." : editingId ? "Salvar" : "Cadastrar"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg text-sm transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL REDE ===================== */}
      {showRedeForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="font-bold text-lg">{editRedeId ? "Editar Rede" : "Nova Rede"}</h3>
              <button onClick={() => setShowRedeForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleRedeSubmit} className="p-5 space-y-4">
              {redeErro && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{redeErro}</div>
              )}
              <div>
                <label className="text-xs text-zinc-500 uppercase">Nome da Rede</label>
                <input required value={redeNome} onChange={(e) => setRedeNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                  placeholder="Ex: Smart Fit" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={redeSaving}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                  {redeSaving ? "Salvando..." : editRedeId ? "Salvar" : "Cadastrar"}
                </button>
                <button type="button" onClick={() => setShowRedeForm(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg text-sm transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
