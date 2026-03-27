"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Calendar,
  CreditCard,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Início", href: "/dashboard/personal", icon: User },
  { label: "Meus Horários", href: "/dashboard/personal/horarios", icon: Calendar },
  { label: "Assinatura", href: "/dashboard/personal/assinatura", icon: CreditCard },
];

interface UserSession {
  nome: string;
  sobrenome: string;
  email: string;
  avatarUrl?: string;
  tipo: string;
}

export default function DashboardPersonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || (data.tipo !== "personal" && data.tipo !== "ambos")) {
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
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/personal" className="text-lg font-black italic tracking-tight">
              Personal<span className="text-yellow-500">Agora</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    pathname === item.href
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
            >
              {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:block">{user.nome}</span>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-medium">{user.nome} {user.sobrenome}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard/personal/horarios"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition"
                  >
                    <Calendar className="w-4 h-4" /> Meus Horários
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNav && (
          <nav className="md:hidden border-t border-zinc-800 px-6 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNav(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  pathname === item.href
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
