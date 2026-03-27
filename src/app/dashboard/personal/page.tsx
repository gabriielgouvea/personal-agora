"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, Calendar, Clock, MapPin, Dumbbell, Pencil, Plus, X } from "lucide-react";

interface UserData {
  nome: string;
  sobrenome: string;
  plano: string | null;
  disponibilidade: string | null;
  modalidades: string | null;
  regioes: string | null;
  academias: string | null;
}

const DIAS_LABEL: Record<string, string> = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
  dom: "Domingo",
};

export default function DashboardPersonalPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [acadModal, setAcadModal] = useState(false);
  const [acadList, setAcadList] = useState<string[]>([]);
  const [acadSearch, setAcadSearch] = useState("");
  const [acadDB, setAcadDB] = useState<{ id: string; nome: string; endereco: string }[]>([]);
  const [acadSaving, setAcadSaving] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setUser(d);
        if (d?.academias) {
          try { setAcadList(JSON.parse(d.academias)); } catch { /* noop */ }
        }
      })
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const disp: Record<string, string[]> = user.disponibilidade
    ? JSON.parse(user.disponibilidade)
    : {};
  const totalSlots = Object.values(disp).reduce((sum, arr) => sum + arr.length, 0);
  const diasAtivos = Object.entries(disp).filter(([, arr]) => arr.length > 0);
  const modalidades: string[] = user.modalidades ? JSON.parse(user.modalidades) : [];
  const regioes: string[] = user.regioes ? JSON.parse(user.regioes) : [];

  // academias modal helpers
  function openAcadModal() {
    fetch("/api/academias?busca=")
      .then((r) => r.json())
      .then((d) => setAcadDB(Array.isArray(d) ? d : []))
      .catch(() => {});
    setAcadSearch("");
    setAcadModal(true);
    setTimeout(() => searchRef.current?.focus(), 100);
  }

  function addAcad(nome: string) {
    if (!acadList.includes(nome)) setAcadList((p) => [...p, nome]);
    setAcadSearch("");
  }

  function removeAcad(nome: string) {
    setAcadList((p) => p.filter((a) => a !== nome));
  }

  async function saveAcad() {
    setAcadSaving(true);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ academias: JSON.stringify(acadList) }),
    });
    setAcadSaving(false);
    setAcadModal(false);
    setUser((u) => u ? { ...u, academias: JSON.stringify(acadList) } : u);
  }

  const filteredAcadDB = acadDB.filter(
    (a) =>
      a.nome.toLowerCase().includes(acadSearch.toLowerCase()) &&
      !acadList.includes(a.nome)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black italic tracking-tight">
          Olá, <span className="text-yellow-500">{user.nome}</span>!
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Plano {user.plano ? user.plano.charAt(0).toUpperCase() + user.plano.slice(1) : "—"}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-yellow-500" />
            <h3 className="text-sm font-semibold">Disponibilidade</h3>
          </div>
          {totalSlots > 0 ? (
            <div className="space-y-2">
              {diasAtivos.map(([dia, horarios]) => (
                <div key={dia}>
                  <p className="text-xs font-medium text-zinc-400">{DIAS_LABEL[dia] || dia}</p>
                  <p className="text-xs text-zinc-600">
                    {horarios[0]} — {horarios[horarios.length - 1]}
                    <span className="text-zinc-700 ml-1">({horarios.length} slots)</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">Nenhum horário cadastrado</p>
          )}
          <Link
            href="/dashboard/personal/horarios"
            className="mt-4 inline-flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400 transition"
          >
            <Clock className="w-3 h-3" /> Editar horários →
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <Dumbbell className="w-5 h-5 text-yellow-500" />
            <h3 className="text-sm font-semibold">Modalidades</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {modalidades.length > 0 ? (
              modalidades.map((m) => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20"
                >
                  {m}
                </span>
              ))
            ) : (
              <p className="text-zinc-600 text-sm">—</p>
            )}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-yellow-500" />
            <h3 className="text-sm font-semibold">Regiões</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {regioes.length > 0 ? (
              regioes.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20"
                >
                  {r}
                </span>
              ))
            ) : (
              <p className="text-zinc-600 text-sm">—</p>
            )}
          </div>
        </div>
      </div>

      {/* Card Academias */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-yellow-500" />
            <h3 className="text-sm font-semibold">Academias</h3>
          </div>
          <button
            onClick={openAcadModal}
            className="flex items-center gap-1.5 text-xs text-yellow-500 hover:text-yellow-400 transition"
          >
            <Pencil className="w-3 h-3" /> Editar
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {acadList.length > 0 ? (
            acadList.map((a) => (
              <span
                key={a}
                className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20"
              >
                {a}
              </span>
            ))
          ) : (
            <p className="text-zinc-600 text-sm">Nenhuma academia cadastrada</p>
          )}
        </div>
      </div>

      {totalSlots === 0 && (
        <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-amber-400 text-sm font-medium mb-1">Seus horários ainda não foram configurados</p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Alunos que buscam um dia/horário específico só verão personais com disponibilidade naquele momento.
            Configure seus horários para aparecer nas buscas.
          </p>
          <Link
            href="/dashboard/personal/horarios"
            className="mt-3 inline-block px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition"
          >
            Configurar Horários
          </Link>
        </div>
      )}

      {/* Modal Academias */}
      {acadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => e.target === e.currentTarget && setAcadModal(false)}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Academias</h2>
              <button onClick={() => setAcadModal(false)} className="text-zinc-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selecionadas */}
            {acadList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {acadList.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 text-xs border border-yellow-500/30"
                  >
                    {a}
                    <button onClick={() => removeAcad(a)} className="ml-0.5 hover:text-red-400 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Busca */}
            <div className="relative">
              <input
                ref={searchRef}
                value={acadSearch}
                onChange={(e) => {
                  setAcadSearch(e.target.value);
                  if (e.target.value.length >= 2) {
                    fetch(`/api/academias?busca=${encodeURIComponent(e.target.value)}`)
                      .then((r) => r.json())
                      .then((d) => setAcadDB(Array.isArray(d) ? d : []))
                      .catch(() => {});
                  }
                }}
                placeholder="Buscar ou adicionar academia..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-500 transition"
              />
            </div>

            {/* Sugestões do banco */}
            {filteredAcadDB.length > 0 && (
              <ul className="bg-zinc-800 border border-zinc-700 rounded-lg divide-y divide-zinc-700 max-h-44 overflow-y-auto">
                {filteredAcadDB.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => addAcad(a.nome)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-700 transition flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      <span>
                        <span className="font-medium">{a.nome}</span>
                        {a.endereco && <span className="text-zinc-500 text-xs ml-1">— {a.endereco}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Adicionar nome personalizado */}
            {acadSearch.length >= 2 && !filteredAcadDB.find((a) => a.nome.toLowerCase() === acadSearch.toLowerCase()) && !acadList.includes(acadSearch) && (
              <button
                onClick={() => addAcad(acadSearch)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-zinc-800 border border-dashed border-zinc-600 rounded-lg text-sm text-zinc-300 hover:border-yellow-500 hover:text-yellow-400 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar &ldquo;{acadSearch}&rdquo;
              </button>
            )}

            <button
              onClick={saveAcad}
              disabled={acadSaving}
              className="w-full py-2.5 bg-yellow-500 text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition disabled:opacity-60"
            >
              {acadSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
