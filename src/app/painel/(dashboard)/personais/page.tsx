"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, X, CheckCircle, XCircle, ExternalLink, Download, UserRound, Dumbbell, KeyRound, Copy, Mail, MessageCircle, Check, Loader2 } from "lucide-react";

interface User {
  id: string;
  tipo: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  sexo: string;
  status: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface PersonalDetail {
  id: string;
  tipo: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  cep: string;
  cidade: string;
  bairro: string;
  status: string;
  avatarUrl: string | null;
  cref: string | null;
  validadeCref: string | null;
  formacao: string | null;
  rg: string | null;
  fotoCrefUrl: string | null;
  selfieUrl: string | null;
  disponivelEmCasa: boolean | null;
  valorAproximado: string | null;
  tipoChavePix: string | null;
  chavePix: string | null;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ativo: "bg-green-500/10 text-green-400",
    pendente: "bg-yellow-500/10 text-yellow-400",
    suspenso: "bg-red-500/10 text-red-400",
    rejeitado: "bg-zinc-500/10 text-zinc-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${map[status] || "bg-zinc-800 text-zinc-400"}`}>
      {status}
    </span>
  );
}

export default function PersonaisPage() {
  const [tab, setTab] = useState<"todos" | "pendentes">("todos");
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busca, setBusca] = useState("");
  const [sexo, setSexo] = useState("");
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<PersonalDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<PersonalDetail>>({});
  const [saving, setSaving] = useState(false);

  // Reset link
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetCopied, setResetCopied] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ tipo: "personal", page: String(page) });
    if (tab === "pendentes") params.set("status", "pendente");
    if (busca) params.set("busca", busca);
    if (sexo) params.set("sexo", sexo);

    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, [page, busca, sexo, tab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    setDetail(null);
    setEditing(false);
    const res = await fetch(`/api/admin/users/${id}`);
    const data = await res.json();
    setDetail(data);
    setEditData(data);
    setDetailLoading(false);
  }

  async function saveEdit() {
    if (!detail) return;
    setSaving(true);
    await fetch(`/api/admin/users/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setSaving(false);
    setEditing(false);
    setDetail({ ...detail, ...editData } as PersonalDetail);
    fetchUsers();
  }

  function verComo(userId: string, tipoVisao: "aluno" | "personal") {
    window.open(`/api/admin/impersonate/direct?userId=${userId}&tipo=${tipoVisao}`, "_blank");
  }

  async function changeStatus(id: string, status: string) {
    await fetch(`/api/admin/users/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (detail?.id === id) setDetail({ ...detail, status } as PersonalDetail);
    fetchUsers();
  }

  async function gerarResetLink(id: string) {
    setResetLoading(true);
    setResetLink(null);
    setResetCopied(false);
    setResetEmailSent(false);
    const res = await fetch(`/api/admin/users/${id}/reset-link`, { method: "POST" });
    const data = await res.json();
    if (data.link) setResetLink(data.link);
    setResetLoading(false);
  }

  function copiarLink() {
    if (!resetLink) return;
    navigator.clipboard.writeText(resetLink);
    setResetCopied(true);
    setTimeout(() => setResetCopied(false), 2500);
  }

  async function enviarEmail() {
    if (!detail) return;
    setResetEmailSent(false);
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: detail.email }),
    });
    setResetEmailSent(true);
    setTimeout(() => setResetEmailSent(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Personais</h2>
        <p className="text-zinc-500 text-sm mt-1">{total} personais {tab === "pendentes" ? "pendentes" : "cadastrados"}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 w-fit">
        <button
          onClick={() => { setTab("todos"); setPage(1); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "todos" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => { setTab("pendentes"); setPage(1); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "pendentes" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          Pendentes
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(1); }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition"
          />
        </div>
        <select
          value={sexo}
          onChange={(e) => { setSexo(e.target.value); setPage(1); }}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500"
        >
          <option value="">Todos os sexos</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-zinc-400">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">E-mail</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">Sexo</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  Nenhum personal encontrado.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-zinc-900 hover:bg-zinc-900/30">
                  <td className="p-3 font-medium flex items-center gap-2">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                        {u.nome[0]}
                      </div>
                    )}
                    {u.nome} {u.sobrenome}
                  </td>
                  <td className="p-3 text-zinc-400">{u.email}</td>
                  <td className="p-3 text-zinc-400">{u.telefone}</td>
                  <td className="p-3 text-zinc-400 capitalize">{u.sexo}</td>
                  <td className="p-3"><StatusBadge status={u.status} /></td>
                  <td className="p-3 text-zinc-500 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <button
                      onClick={() => openDetail(u.id)}
                      className="text-yellow-500 hover:text-yellow-400 transition"
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </button>
                    {u.status === "pendente" && (
                      <>
                        <button
                          onClick={() => changeStatus(u.id, "ativo")}
                          className="text-green-400 hover:text-green-300 transition"
                          title="Aprovar"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => changeStatus(u.id, "rejeitado")}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Rejeitar"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="text-zinc-400 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-zinc-400">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="text-zinc-400 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            {detailLoading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
              </div>
            ) : detail ? (
              <>
                <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                  <h3 className="font-bold text-lg">Detalhes do Personal</h3>
                  <button onClick={() => { setDetail(null); setResetLink(null); }} className="text-zinc-500 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4">
                    {detail.avatarUrl ? (
                      <img src={detail.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl text-zinc-500">
                        {detail.nome[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-lg">{detail.nome} {detail.sobrenome}</p>
                      <StatusBadge status={detail.status} />
                    </div>
                  </div>

                  {/* CREF / Selfie images */}
                  {(detail.fotoCrefUrl || detail.selfieUrl) && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Documentos enviados</p>
                      <div className="grid grid-cols-2 gap-3">
                        {detail.fotoCrefUrl && (
                          <div className="space-y-1.5">
                            <p className="text-xs text-zinc-500">Foto do CREF</p>
                            <a href={detail.fotoCrefUrl} target="_blank" rel="noopener noreferrer">
                              <img
                                src={detail.fotoCrefUrl}
                                alt="CREF"
                                className="w-full rounded-lg border border-zinc-700 hover:border-yellow-500 transition cursor-pointer object-cover"
                                style={{ maxHeight: 160 }}
                              />
                            </a>
                            <div className="flex gap-1.5">
                              <a
                                href={detail.fotoCrefUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg transition"
                              >
                                <ExternalLink size={12} /> Ver
                              </a>
                              <a
                                href={detail.fotoCrefUrl}
                                download="foto-cref"
                                className="flex-1 flex items-center justify-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg transition"
                              >
                                <Download size={12} /> Baixar
                              </a>
                            </div>
                          </div>
                        )}
                        {detail.selfieUrl && (
                          <div className="space-y-1.5">
                            <p className="text-xs text-zinc-500">Selfie</p>
                            <a href={detail.selfieUrl} target="_blank" rel="noopener noreferrer">
                              <img
                                src={detail.selfieUrl}
                                alt="Selfie"
                                className="w-full rounded-lg border border-zinc-700 hover:border-yellow-500 transition cursor-pointer object-cover"
                                style={{ maxHeight: 160 }}
                              />
                            </a>
                            <div className="flex gap-1.5">
                              <a
                                href={detail.selfieUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg transition"
                              >
                                <ExternalLink size={12} /> Ver
                              </a>
                              <a
                                href={detail.selfieUrl}
                                download="selfie"
                                className="flex-1 flex items-center justify-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg transition"
                              >
                                <Download size={12} /> Baixar
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {!detail.fotoCrefUrl && !detail.selfieUrl && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                      <p className="text-zinc-500 text-xs">Nenhum documento enviado</p>
                    </div>
                  )}

                  {editing ? (
                    <div className="space-y-3">
                      {(["nome", "sobrenome", "email", "telefone", "cpf", "dataNascimento", "cep", "cidade", "bairro", "cref", "validadeCref", "formacao", "rg", "valorAproximado"] as const).map((field) => (
                        <div key={field}>
                          <label className="text-xs text-zinc-500 uppercase">{field}</label>
                          <input
                            value={(editData as Record<string, string>)[field] || ""}
                            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-zinc-500 uppercase">Sexo</label>
                        <select
                          value={editData.sexo || ""}
                          onChange={(e) => setEditData({ ...editData, sexo: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                        >
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!editData.disponivelEmCasa}
                          onChange={(e) => setEditData({ ...editData, disponivelEmCasa: e.target.checked })}
                          className="accent-yellow-500"
                        />
                        <label className="text-sm text-zinc-400">Disponível em casa</label>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg text-sm transition disabled:opacity-50"
                        >
                          {saving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-zinc-500 text-xs">E-mail</p>
                          <p>{detail.email}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Telefone</p>
                          <p>{detail.telefone}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">CPF</p>
                          <p>{detail.cpf}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">RG</p>
                          <p>{detail.rg || "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Data Nascimento</p>
                          <p>{detail.dataNascimento || "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Sexo</p>
                          <p className="capitalize">{detail.sexo || "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">CREF</p>
                          <p>{detail.cref || "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Validade CREF</p>
                          <p>{detail.validadeCref || "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Formação</p>
                          <p>{detail.formacao || "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Valor Aprox.</p>
                          <p>{detail.valorAproximado ? `R$ ${detail.valorAproximado}` : "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Cidade</p>
                          <p>{detail.cidade || "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Bairro</p>
                          <p>{detail.bairro || "—"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Disp. em Casa</p>
                          <p>{detail.disponivelEmCasa ? "Sim" : "Não"}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs">Pix</p>
                          <p>{detail.chavePix ? `${detail.tipoChavePix}: ${detail.chavePix}` : "—"}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setEditing(true)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg text-sm transition"
                        >
                          Editar
                        </button>
                        {detail.status === "pendente" && (
                          <>
                            <button
                              onClick={() => changeStatus(detail.id, "ativo")}
                              className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-2 rounded-lg text-sm transition"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => changeStatus(detail.id, "rejeitado")}
                              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm transition"
                            >
                              Rejeitar
                            </button>
                          </>
                        )}
                        {detail.status === "ativo" && (
                          <button
                            onClick={() => changeStatus(detail.id, "suspenso")}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm transition"
                          >
                            Suspender
                          </button>
                        )}
                        {(detail.status === "suspenso" || detail.status === "rejeitado") && (
                          <button
                            onClick={() => changeStatus(detail.id, "ativo")}
                            className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-2 rounded-lg text-sm transition"
                          >
                            Ativar
                          </button>
                        )}
                      </div>

                      {/* Ver como Aluno / Personal */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => verComo(detail.id, "personal")}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 py-2 rounded-lg text-sm font-medium transition"
                        >
                          <Dumbbell size={14} /> Ver como Personal
                        </button>
                        {(detail.tipo === "ambos") && (
                          <button
                            onClick={() => verComo(detail.id, "aluno")}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <UserRound size={14} /> Ver como Aluno
                          </button>
                        )}
                      </div>

                      {detail.telefone && (
                        <a
                          href={`https://wa.me/55${detail.telefone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg text-sm transition"
                        >
                          Contato via WhatsApp
                        </a>
                      )}

                      {/* ── Redefinição de senha ── */}
                      <div className="border-t border-zinc-800 pt-3">
                        {!resetLink ? (
                          <button
                            onClick={() => gerarResetLink(detail.id)}
                            disabled={resetLoading}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition disabled:opacity-60"
                          >
                            {resetLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <KeyRound className="w-4 h-4" />
                            )}
                            Gerar link de redefinição de senha
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-zinc-500 font-medium">Link de redefinição (válido por 24h)</p>
                            <div className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-3 py-2">
                              <p className="text-xs text-zinc-400 flex-1 truncate font-mono">{resetLink}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={copiarLink}
                                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                                  resetCopied
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                }`}
                              >
                                {resetCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {resetCopied ? "Copiado!" : "Copiar"}
                              </button>
                              <button
                                onClick={enviarEmail}
                                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                                  resetEmailSent
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                }`}
                              >
                                {resetEmailSent ? <Check className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                                {resetEmailSent ? "Enviado!" : "E-mail"}
                              </button>
                              {detail.telefone && (
                                <a
                                  href={`https://wa.me/55${detail.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${detail.nome}! Segue seu link para redefinir a senha da plataforma Personal Agora:\n${resetLink}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => { setResetLink(null); setResetCopied(false); setResetEmailSent(false); }}
                              className="text-xs text-zinc-600 hover:text-zinc-400 transition"
                            >
                              Fechar
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
