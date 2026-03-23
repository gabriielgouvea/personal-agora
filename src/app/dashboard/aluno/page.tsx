"use client";

import { useEffect, useState } from "react";

export default function DashboardAlunoPage() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.nome) setNome(data.nome);
      });
  }, []);

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase italic tracking-tight mb-2">
        Olá, <span className="text-yellow-500">{nome || "..."}</span> 👋
      </h1>
      <p className="text-zinc-400 mb-10">
        Bem-vindo à plataforma. Em breve você poderá buscar personais aqui.
      </p>

      {/* Placeholder cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wide mb-2">Buscar Personal</p>
          <p className="text-zinc-600 text-sm">Em breve</p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wide mb-2">Minhas Aulas</p>
          <p className="text-zinc-600 text-sm">Em breve</p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wide mb-2">Meus Planos</p>
          <p className="text-zinc-600 text-sm">Em breve</p>
        </div>
      </div>
    </div>
  );
}
