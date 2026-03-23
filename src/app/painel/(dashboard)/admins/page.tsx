"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Trash2, Plus, X } from "lucide-react";

interface Admin {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function fetchAdmins() {
    const res = await fetch("/api/admin/admins");
    const data = await res.json();
    setAdmins(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setSaving(true);

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao criar administrador");
      setSaving(false);
      return;
    }

    setSucesso("Administrador criado com sucesso!");
    setNome("");
    setEmail("");
    setSenha("");
    setShowForm(false);
    setSaving(false);
    fetchAdmins();
    setTimeout(() => setSucesso(""), 3000);
  }

  async function handleDelete(id: string, adminNome: string) {
    if (!confirm(`Tem certeza que deseja remover o admin "${adminNome}"?`)) return;

    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao remover");
      return;
    }
    fetchAdmins();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Administradores</h2>
          <p className="text-zinc-500 text-sm mt-1">Gerencie os acessos ao painel</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Fechar" : "Novo Admin"}
        </button>
      </div>

      {sucesso && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">
          {sucesso}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Novo Administrador</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {erro}
              </div>
            )}
            <div>
              <label className="text-xs text-zinc-500 uppercase">Nome</label>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                placeholder="admin@personalagora.com"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {saving ? "Criando..." : "Criar Administrador"}
            </button>
          </form>
        </div>
      )}

      {/* Admins list */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-zinc-400">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">E-mail</th>
              <th className="text-left p-3">Criado em</th>
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
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  Nenhum administrador encontrado.
                </td>
              </tr>
            ) : (
              admins.map((a) => (
                <tr key={a.id} className="border-t border-zinc-900 hover:bg-zinc-900/30">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <ShieldCheck size={16} className="text-yellow-500" />
                    {a.nome}
                  </td>
                  <td className="p-3 text-zinc-400">{a.email}</td>
                  <td className="p-3 text-zinc-500">{new Date(a.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3">
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
