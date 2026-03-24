"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  DollarSign,
  ShieldCheck,
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface AdminSession {
  adminId: string;
  nome: string;
  email: string;
}

const navItems = [
  { href: "/painel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/painel/alunos", label: "Alunos", icon: Users },
  { href: "/painel/personais", label: "Personais", icon: Dumbbell },
  { href: "/painel/academias", label: "Academias", icon: Building2 },
  { href: "/painel/faturamento", label: "Faturamento", icon: DollarSign },
  { href: "/painel/admins", label: "Administradores", icon: ShieldCheck },
];

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          router.replace("/painel/login");
        } else {
          setAdmin(data);
          setLoading(false);
        }
      })
      .catch(() => router.replace("/painel/login"));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/painel/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-lg font-extrabold tracking-tighter uppercase italic">
            Personal <span className="text-yellow-500">Agora</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Painel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="text-sm text-zinc-400 mb-3 truncate">
            {admin?.nome}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 transition"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
          <button onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-sm font-bold uppercase italic">
            Personal <span className="text-yellow-500">Agora</span>
          </span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
