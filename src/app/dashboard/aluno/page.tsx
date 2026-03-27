"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Dumbbell, MapPin, MessageCircle } from "lucide-react";

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
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase italic tracking-tight mb-1">
          Olá, <span className="text-yellow-500">{nome || "..."}</span>!
        </h1>
        <p className="text-zinc-500 text-sm">Pronto para treinar? Encontre seu personal ideal.</p>
      </div>

      {/* CTA principal */}
      <Link
        href="/dashboard/aluno/buscar"
        className="block w-full p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition group mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-white mb-1">Buscar Personal Trainer</p>
            <p className="text-sm text-zinc-400">Filtre por modalidade, região e academia</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center group-hover:scale-110 transition">
            <Search className="w-6 h-6 text-black" />
          </div>
        </div>
      </Link>

      {/* Cards informativos */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <Dumbbell className="w-6 h-6 text-yellow-500 mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Filtre por Modalidade</p>
          <p className="text-xs text-zinc-500">Musculação, Funcional, Crossfit, Pilates e muito mais.</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <MapPin className="w-6 h-6 text-yellow-500 mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Por Região ou Academia</p>
          <p className="text-xs text-zinc-500">Encontre personais que atendem na sua região ou academia preferida.</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <MessageCircle className="w-6 h-6 text-yellow-500 mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Contato Direto</p>
          <p className="text-xs text-zinc-500">Entre em contato via WhatsApp diretamente com o personal.</p>
        </div>
      </div>
    </div>
  );
}
