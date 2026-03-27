"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Camera,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Início", href: "/dashboard/aluno" },
  { label: "Buscar Personal", href: "/dashboard/aluno/buscar" },
];

interface UserSession {
  nome: string;
  sobrenome: string;
  email: string;
  avatarUrl?: string;
}

export default function DashboardAlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserSession | null>(null);

  // Buscar sessão do usuário
  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          router.replace("/login");
          return;
        }
        setUser(data);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const initials = user
    ? `${user.nome[0]}${user.sobrenome[0]}`.toUpperCase()
    : "";

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Top bar ── */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard/aluno"
            className="text-xl font-bold italic uppercase tracking-tighter"
          >
            Personal <span className="text-yellow-500">Agora</span>
          </Link>

          {/* Nav center */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  pathname === item.href
                    ? "text-yellow-500"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Avatar + Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 group"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-yellow-500/50 transition flex items-center justify-center">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-zinc-400">
                    {initials}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User info header */}
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center group">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt={user.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-zinc-400">
                          {initials}
                        </span>
                      )}
                      {/* Overlay para trocar foto */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.nome} {user.sobrenome}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href="/dashboard/aluno/conta"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                  >
                    <Settings className="w-4 h-4 text-zinc-500" />
                    Minha Conta
                  </Link>
                  <Link
                    href="/dashboard/aluno/suporte"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                  >
                    <HelpCircle className="w-4 h-4 text-zinc-500" />
                    Suporte
                  </Link>
                </div>

                <div className="border-t border-zinc-800 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="pt-16">{children}</main>
    </div>
  );
}
