import Link from "next/link";
import { ArrowRight, CheckCircle2, Trophy, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-yellow-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-zinc-900/40 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-bold italic uppercase tracking-tighter">
                Personal <span className="text-yellow-500">Agora</span>
            </span>
            <Link href="/cadastro" className="text-sm font-medium text-zinc-300 hover:text-white transition">
                Área do Profissional
            </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="container mx-auto max-w-5xl text-center z-10 relative">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                Em breve em Alphaville
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic leading-[0.9] md:leading-[0.85] animate-in fade-in zoom-in duration-1000">
                Sua agenda <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Lotada.</span>
            </h1>

            <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                A primeira plataforma exclusiva que conecta alunos de alta performance aos melhores Personal Trainers da região.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Link 
                    href="/cadastro" 
                    className="group relative px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    Fazer Pré-Cadastro Gratuito
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-zinc-500 text-sm hidden sm:block">Vagas limitadas para o lançamento</span>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hovered-card group hover:border-yellow-500/30 transition-all">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-yellow-500 mb-6 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Conexão Direta</h3>
                    <p className="text-zinc-400 leading-relaxed">
                        Alunos qualificados procuram você pelo seu perfil, especialidade e local de atendimento. Sem intermediários.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hovered-card group hover:border-yellow-500/30 transition-all">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-yellow-500 mb-6 group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Exclusividade</h3>
                    <p className="text-zinc-400 leading-relaxed">
                        Focado na região de Alphaville e arredores. Esteja onde o público de alta renda está procurando.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hovered-card group hover:border-yellow-500/30 transition-all">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-yellow-500 mb-6 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Perfil Verificado</h3>
                    <p className="text-zinc-400 leading-relaxed">
                        Selo de verificação para profissionais com CREF ativo, aumentando sua autoridade e confiança.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-zinc-900 text-center">
        <a 
            href="https://wa.me/5511914007287" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-zinc-600 text-xs hover:text-yellow-500 transition-colors uppercase tracking-widest"
        >
            &copy; 2026 Gabriel Gouvea • Gouvea Automações
        </a>
      </footer>
    </main>
  );
}
