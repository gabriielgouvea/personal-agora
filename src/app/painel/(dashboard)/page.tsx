"use client";

import { useEffect, useState } from "react";
import { Users, Dumbbell, Clock, TrendingUp, Building2, Gift, Ticket } from "lucide-react";

interface Stats {
  totalAlunos: number;
  totalPersonais: number;
  personaisPendentes: number;
  alunosMulheres: number;
  alunosHomens: number;
  personaisMulheres: number;
  personaisHomens: number;
  totalAcademias: number;
  totalConvites: number;
  totalCupons: number;
  totalUsuarios: number;
  faturamentoTotal: number;
  faturamentoMes: number;
  recentUsers: {
    id: string;
    tipo: string;
    nome: string;
    sobrenome: string;
    email: string;
    status: string;
    createdAt: string;
    avatarUrl: string | null;
  }[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400 text-sm">{label}</span>
        <Icon size={18} className={accent || "text-zinc-600"} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
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

export default function PainelDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p className="text-zinc-500 text-sm mt-1">Visão geral da plataforma</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de Alunos"
          value={stats.totalAlunos}
          icon={Users}
          accent="text-blue-400"
          sub={`${stats.alunosMulheres} mulheres · ${stats.alunosHomens} homens`}
        />
        <StatCard
          label="Total de Personais"
          value={stats.totalPersonais}
          icon={Dumbbell}
          accent="text-yellow-500"
          sub={`${stats.personaisMulheres} mulheres · ${stats.personaisHomens} homens`}
        />
        <StatCard
          label="Pendentes Aprovação"
          value={stats.personaisPendentes}
          icon={Clock}
          accent="text-orange-400"
          sub="Personais aguardando"
        />
        <StatCard
          label="Academias"
          value={stats.totalAcademias}
          icon={Building2}
          accent="text-purple-400"
          sub="Cadastradas"
        />
        <StatCard
          label="Convites"
          value={stats.totalConvites}
          icon={Gift}
          accent="text-pink-400"
          sub="Gerados"
        />
        <StatCard
          label="Cupons"
          value={stats.totalCupons}
          icon={Ticket}
          accent="text-cyan-400"
          sub="Cadastrados"
        />
        <StatCard
          label="Faturamento"
          value={`R$ ${stats.faturamentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          accent="text-green-400"
          sub="Total acumulado"
        />
      </div>

      {/* Recent users */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Cadastros Recentes</h3>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/60 text-zinc-400">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">E-mail</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u) => (
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
                  <td className="p-3">
                    <span className={u.tipo === "personal" ? "text-yellow-500" : "text-blue-400"}>
                      {u.tipo === "personal" ? "Personal" : "Aluno"}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">{u.email}</td>
                  <td className="p-3"><StatusBadge status={u.status} /></td>
                  <td className="p-3 text-zinc-500 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
