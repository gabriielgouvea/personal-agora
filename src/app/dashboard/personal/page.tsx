"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Dumbbell } from "lucide-react";

interface UserData {
  nome: string;
  sobrenome: string;
  plano: string | null;
  disponibilidade: string | null;
  modalidades: string | null;
  regioes: string | null;
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

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
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
    </div>
  );
}
