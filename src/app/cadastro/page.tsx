import Link from "next/link";
import { ArrowLeft, ArrowRight, Users, Dumbbell } from "lucide-react";

export default function CadastroPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 selection:bg-yellow-500 selection:text-black">
      <div className="w-full max-w-2xl">
        <Link href="/" className="block text-center mb-10">
          <span className="text-2xl font-bold italic uppercase tracking-tighter">
            Personal <span className="text-yellow-500">Agora</span>
          </span>
        </Link>

        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-center mb-3">
          Criar <span className="text-yellow-500">Conta</span>
        </h1>
        <p className="text-zinc-400 text-center mb-10">Selecione como você quer usar a plataforma</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/cadastro/aluno"
            className="group p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-yellow-500/30 transition-all text-left"
          >
            <Users className="w-10 h-10 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold mb-2">Sou Aluno</h2>
            <p className="text-zinc-400 text-sm mb-4">Quero encontrar um personal trainer na minha região.</p>
            <span className="inline-flex items-center gap-1 text-yellow-500 text-sm font-semibold group-hover:gap-2 transition-all">
              Continuar <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            href="/cadastro/personal"
            className="group p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-yellow-500/30 transition-all text-left"
          >
            <Dumbbell className="w-10 h-10 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold mb-2">Sou Personal</h2>
            <p className="text-zinc-400 text-sm mb-4">Quero receber alunos e lotar minha agenda.</p>
            <span className="inline-flex items-center gap-1 text-yellow-500 text-sm font-semibold group-hover:gap-2 transition-all">
              Continuar <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            Já tem conta?{" "}
            <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-semibold transition">
              Entrar
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para home
          </Link>
        </div>
      </div>
    </main>
  );
}