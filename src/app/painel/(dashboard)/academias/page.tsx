"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, Building2 } from "lucide-react";

interface Academia {
  id: string;
  nome: string;
  endereco: string;
  createdAt: string;
}

export default function AcademiasPage() {
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  async function fetchAcademias() {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    const res = await fetch(`/api/admin/academias?${params}`);
    const data = await res.json();
    setAcademias(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchAcademias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  function openNew() {
    setEditingId(null);
    setNome("");
    setEndereco("");
    setErro("");
    setShowForm(true);
  }

  function openEdit(a: Academia) {
    setEditingId(a.id);
    setNome(a.nome);
    setEndereco(a.endereco);
    setErro("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSaving(true);

    const url = editingId
      ? `/api/admin/academias/${editingId}`
      : "/api/admin/academias";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, endereco }),
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
    if (!res.ok) {
      alert("Erro ao remover");
      return;
    }
    fetchAcademias();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Academias</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {academias.length} academia{academias.length !== 1 ? "s" : ""} cadastrada{academias.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition"
        >
          <Plus size={16} />
          Nova Academia
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar por nome ou endereço..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition"
        />
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="font-bold text-lg">
                {editingId ? "Editar Academia" : "Nova Academia"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {erro && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                  {erro}
                </div>
              )}
              <div>
                <label className="text-xs text-zinc-500 uppercase">Nome da Academia</label>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                  placeholder="Ex: Smart Fit Alphaville"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase">Endereço</label>
                <input
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                  placeholder="Ex: Av. Alphaville, 1000 - Barueri"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {saving ? "Salvando..." : editingId ? "Salvar" : "Cadastrar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-zinc-400">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Endereço</th>
              <th className="text-left p-3">Cadastrado em</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto" />
                </td>
              </tr>
            ) : academias.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  <Building2 size={32} className="mx-auto mb-2 text-zinc-700" />
                  Nenhuma academia cadastrada.
                </td>
              </tr>
            ) : (
              academias.map((a) => (
                <tr key={a.id} className="border-t border-zinc-900 hover:bg-zinc-900/30">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <Building2 size={16} className="text-purple-400" />
                    {a.nome}
                  </td>
                  <td className="p-3 text-zinc-400">{a.endereco}</td>
                  <td className="p-3 text-zinc-500 whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <button
                      onClick={() => openEdit(a)}
                      className="text-yellow-500 hover:text-yellow-400 transition"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id, a.nome)}
                      className="text-red-400 hover:text-red-300 transition"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
