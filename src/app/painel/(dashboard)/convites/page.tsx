"use client";

import { useEffect, useState } from "react";
import { Gift, Plus, Trash2, Check, Search } from "lucide-react";

interface Convite {
  id: string;
  codigo: string;
  cpf: string;
  usado: boolean;
  usadoPor: string | null;
  createdAt: string;
}

export default function ConvitesPage() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cpf, setCpf] = useState("");
  const [creating, setCreating] = useState(false);
  const [busca, setBusca] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchConvites();
  }, []);

  async function fetchConvites() {
    const res = await fetch("/api/admin/convites");
    if (res.ok) setConvites(await res.json());
    setLoading(false);
  }

  async function handleCreate() {
    if (!cpf.trim()) return;
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/admin/convites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf }),
    });
    if (res.ok) {
      setCpf("");
      setShowForm(false);
      fetchConvites();
    } else {
      const err = await res.json().catch(() => ({}));
      setCreateError(err.error || "Erro ao criar convite");
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este convite?")) return;
    await fetch(`/api/admin/convites/${id}`, { method: "DELETE" });
    fetchConvites();
  }

  function maskCpfDisplay(cpf: string) {
    const c = cpf.replace(/\D/g, "");
    if (c.length !== 11) return cpf;
    return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
  }

  const filtered = convites.filter(
    (c) =>
      c.cpf.includes(busca.replace(/\D/g, ""))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">
            Convites
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {convites.length} convite{convites.length !== 1 ? "s" : ""} • Cada convite dá 2 meses grátis no Pro
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-lg transition"
        >
          <Plus size={16} />
          Novo Convite
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-3">Criar Convite</h3>
          <div className="flex gap-3">
            <input
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="CPF do personal convidado"
              className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !cpf.trim()}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-lg transition disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar Convite"}
            </button>
          </div>
          {createError && <p className="text-red-400 text-xs mt-2">{createError}</p>}
          <p className="text-xs text-zinc-600 mt-2">
            O convite será vinculado ao CPF. Na hora do cadastro, o personal só precisa digitar o CPF para validar.
          </p>
        </div>
      )}

      {/* Search */}
      {convites.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por CPF..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
          />
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Gift className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">Nenhum convite encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border ${
                c.usado
                  ? "bg-zinc-900/30 border-zinc-800/50"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    c.usado ? "bg-zinc-800" : "bg-yellow-500/10"
                  }`}>
                    <Gift className={`w-5 h-5 ${c.usado ? "text-zinc-600" : "text-yellow-500"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono font-bold ${c.usado ? "text-zinc-500" : "text-white"}`}>
                        CPF: {maskCpfDisplay(c.cpf)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.usado
                          ? "bg-zinc-800 text-zinc-500"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}>
                        {c.usado ? "Usado" : "Disponível"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Criado em{" "}
                      {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                {!c.usado && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-zinc-600 hover:text-red-400 transition"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
