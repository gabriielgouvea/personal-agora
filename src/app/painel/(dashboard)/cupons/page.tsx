"use client";

import { useEffect, useState } from "react";
import { Ticket, Plus, Trash2, Search, ToggleLeft, ToggleRight } from "lucide-react";

interface Cupom {
  id: string;
  codigo: string;
  tipo: string;
  valor: number;
  validade: string | null;
  limiteUsos: number;
  usosAtuais: number;
  ativo: boolean;
  createdAt: string;
}

export default function CuponsPage() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busca, setBusca] = useState("");

  // Form state
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("percentual");
  const [valor, setValor] = useState("");
  const [validade, setValidade] = useState("");
  const [limiteUsos, setLimiteUsos] = useState("100");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchCupons();
  }, []);

  async function fetchCupons() {
    const res = await fetch("/api/admin/cupons");
    if (res.ok) setCupons(await res.json());
    setLoading(false);
  }

  async function handleCreate() {
    setFormError("");
    if (!codigo.trim() || !valor.trim()) {
      setFormError("Código e valor são obrigatórios");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/admin/cupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, tipo, valor, validade: validade || null, limiteUsos }),
    });
    if (res.ok) {
      setCodigo("");
      setValor("");
      setValidade("");
      setLimiteUsos("100");
      setShowForm(false);
      fetchCupons();
    } else {
      const data = await res.json();
      setFormError(data.error || "Erro ao criar cupom");
    }
    setCreating(false);
  }

  async function handleToggle(id: string, ativo: boolean) {
    await fetch(`/api/admin/cupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    fetchCupons();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este cupom?")) return;
    await fetch(`/api/admin/cupons/${id}`, { method: "DELETE" });
    fetchCupons();
  }

  const filtered = cupons.filter((c) =>
    c.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  const inputCls =
    "w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-500";

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
            Cupons
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {cupons.length} cupom{cupons.length !== 1 ? "ns" : ""} cadastrado{cupons.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-lg transition"
        >
          <Plus size={16} />
          Novo Cupom
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-4">Criar Cupom</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Código</label>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="EX: DESCONTO20"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="percentual">Percentual (%)</option>
                <option value="fixo">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Valor {tipo === "percentual" ? "(%)" : "(R$)"}
              </label>
              <input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                type="number"
                min="0"
                placeholder={tipo === "percentual" ? "10" : "5.00"}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Limite de usos</label>
              <input
                value={limiteUsos}
                onChange={(e) => setLimiteUsos(e.target.value)}
                type="number"
                min="1"
                placeholder="100"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Validade (opcional)</label>
              <input
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                type="date"
                className={inputCls}
              />
            </div>
          </div>
          {formError && <p className="text-red-400 text-xs mt-3">{formError}</p>}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-lg transition disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar Cupom"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-zinc-700 text-zinc-400 text-sm rounded-lg hover:border-zinc-500 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {cupons.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
          />
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">Nenhum cupom encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const expirado = c.validade && new Date() > new Date(c.validade);
            const esgotado = c.usosAtuais >= c.limiteUsos;

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border ${
                  !c.ativo || expirado || esgotado
                    ? "bg-zinc-900/30 border-zinc-800/50"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      c.ativo && !expirado && !esgotado ? "bg-yellow-500/10" : "bg-zinc-800"
                    }`}>
                      <Ticket className={`w-5 h-5 ${
                        c.ativo && !expirado && !esgotado ? "text-yellow-500" : "text-zinc-600"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-bold text-white">
                          {c.codigo}
                        </code>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          {c.tipo === "percentual" ? `${c.valor}%` : `R$ ${c.valor.toFixed(2)}`}
                        </span>
                        {expirado && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                            Expirado
                          </span>
                        )}
                        {esgotado && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-500">
                            Esgotado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Usos: {c.usosAtuais}/{c.limiteUsos}
                        {c.validade && (
                          <> • Válido até {new Date(c.validade).toLocaleDateString("pt-BR")}</>
                        )}
                        {" "}• Criado em {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(c.id, c.ativo)}
                      className="p-2 text-zinc-500 hover:text-white transition"
                      title={c.ativo ? "Desativar" : "Ativar"}
                    >
                      {c.ativo ? (
                        <ToggleRight size={20} className="text-green-500" />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 transition"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
