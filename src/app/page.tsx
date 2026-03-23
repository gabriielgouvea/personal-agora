import Link from "next/link";
import {
  ArrowRight,
  Search,
  MapPin,
  Dumbbell,
  Shield,
  CreditCard,
  Zap,
  Users,
  Star,
  CheckCircle2,
  Clock,
  BadgeCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-yellow-600/8 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-zinc-900/30 blur-[120px] rounded-full pointer-events-none" />

      {/* ───────── NAVBAR ───────── */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold italic uppercase tracking-tighter">
            Personal <span className="text-yellow-500">Agora</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/aluno" className="hidden sm:block text-sm font-medium text-zinc-400 hover:text-white transition">
              Sou Aluno
            </Link>
            <Link href="/personal" className="hidden sm:block text-sm font-medium text-zinc-400 hover:text-white transition">
              Sou Personal
            </Link>
            <Link href="/login" className="text-sm font-medium px-4 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-white transition">
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* ───────── HERO ───────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="container mx-auto max-w-5xl text-center z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            PLATAFORMA ABERTA — ALPHAVILLE
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic leading-[0.9] md:leading-[0.85]">
            Encontre seu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Personal Ideal.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Busque por <strong className="text-zinc-200">academia</strong> ou{" "}
            <strong className="text-zinc-200">região</strong>, escolha o profissional perfeito para você e
            agende aulas avulsas ou planos mensais — com{" "}
            <strong className="text-yellow-500">pagamento 100% seguro</strong> pela plataforma.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/aluno"
              className="group relative px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Sou Aluno
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/personal"
              className="group relative px-8 py-4 bg-transparent border-2 border-zinc-700 hover:border-yellow-500 text-white font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Sou Personal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── COMO FUNCIONA ───────── */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Simples e Rápido</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mt-3">
              Como <span className="text-yellow-500">Funciona</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 group hover:border-yellow-500/30 transition-all">
              <div className="absolute -top-4 -left-2 w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center font-black text-lg">
                1
              </div>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-yellow-500 mb-6 mt-2 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Busque</h3>
              <p className="text-zinc-400 leading-relaxed">
                Pesquise por <strong className="text-zinc-200">academia</strong> (ex: Ironberg, Bluefit) ou por{" "}
                <strong className="text-zinc-200">região</strong> em Alphaville. Veja todos os profissionais
                disponíveis com foto, descrição e avaliações.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 group hover:border-yellow-500/30 transition-all">
              <div className="absolute -top-4 -left-2 w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center font-black text-lg">
                2
              </div>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-yellow-500 mb-6 mt-2 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Escolha & Agende</h3>
              <p className="text-zinc-400 leading-relaxed">
                Escolha o personal que mais combina com você. Agende uma{" "}
                <strong className="text-zinc-200">aula avulsa</strong> urgente ou feche um{" "}
                <strong className="text-zinc-200">plano mensal</strong> — o preço é definido pelo próprio
                profissional.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 group hover:border-yellow-500/30 transition-all">
              <div className="absolute -top-4 -left-2 w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center font-black text-lg">
                3
              </div>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-yellow-500 mb-6 mt-2 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pague com Segurança</h3>
              <p className="text-zinc-400 leading-relaxed">
                O pagamento é feito <strong className="text-zinc-200">100% pela plataforma</strong>. Só após a
                confirmação do pagamento, os dados de contato são liberados para ambas as partes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── POR QUE A PLATAFORMA ───────── */}
      <section className="py-24 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Segurança pra todo mundo</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mt-3">
              Por que usar o <span className="text-yellow-500">Personal Agora</span>?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Pagamento Seguro",
                desc: "Toda transação passa pela plataforma. Aluno só paga se tem vaga; personal só aparece se tem garantia.",
              },
              {
                icon: BadgeCheck,
                title: "Perfis Verificados",
                desc: "Todo cadastro de personal passa por aprovação manual. CREF ativo e dados conferidos antes de ir ao ar.",
              },
              {
                icon: MapPin,
                title: "Busca por Local",
                desc: "Filtre por academia ou bairro em Alphaville e encontre quem está perto de você.",
              },
              {
                icon: Clock,
                title: "Aula Agora ou Plano",
                desc: "Precisa de um treino urgente hoje? Ou quer fechar um plano mensal? As duas opções existem aqui.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-yellow-500/20 transition-all group"
              >
                <Icon className="w-8 h-8 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white mb-2">{title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PARA QUEM É ───────── */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Aluno */}
            <div className="p-8 md:p-10 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-yellow-500/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-yellow-500" />
                <h3 className="text-2xl font-black uppercase italic tracking-tight">Para Alunos</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Encontre personais por academia ou região em segundos",
                  "Veja foto, descrição e avaliações antes de escolher",
                  "Agende aulas avulsas ou planos mensais",
                  "Pagamento seguro — dados de contato só aparecem após o pagamento",
                  "Sem surpresas: o preço é visível antes de fechar",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/aluno"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95"
              >
                Quero Encontrar um Personal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Personal */}
            <div className="p-8 md:p-10 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-yellow-500/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-yellow-500" />
                <h3 className="text-2xl font-black uppercase italic tracking-tight">Para Personais</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Plataforma 100% gratuita para se cadastrar",
                  "Você define o preço — sem interferência",
                  "Alunos chegam até você via tráfego pago, networking e recomendações",
                  "Notificação em tempo real quando um aluno precisa de aula",
                  "Pagamento garantido — dinheiro na sua conta no mesmo dia",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/personal"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95"
              >
                Quero Receber Alunos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TRANSPARÊNCIA ───────── */}
      <section className="py-24 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mb-6">
            Transparência <span className="text-yellow-500">Total</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            O aluno vê apenas o <strong className="text-zinc-200">primeiro nome</strong>,{" "}
            <strong className="text-zinc-200">foto</strong> e um{" "}
            <strong className="text-zinc-200">sobre</strong> do personal — nunca redes sociais ou telefone. As
            informações de contato de ambos só são liberadas{" "}
            <strong className="text-yellow-500">após o pagamento confirmado</strong>. Isso protege o personal e
            garante segurança pro aluno.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="font-bold text-white mb-1 text-sm uppercase tracking-wide">Antes do pagamento</h4>
              <p className="text-zinc-500 text-sm">Primeiro nome, foto, descrição e valor da aula.</p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="font-bold text-white mb-1 text-sm uppercase tracking-wide">Após o pagamento</h4>
              <p className="text-zinc-500 text-sm">WhatsApp, nome completo e dados de contato liberados para ambos.</p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="font-bold text-white mb-1 text-sm uppercase tracking-wide">Pagamento pro Personal</h4>
              <p className="text-zinc-500 text-sm">Dinheiro na conta em até 24h. A plataforma cuida de tudo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── CTA FINAL ───────── */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mb-6">
            Comece <span className="text-yellow-500">Agora</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Seja aluno procurando o treino ideal ou personal buscando lotar sua agenda — a plataforma é pra você.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/aluno"
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 w-full sm:w-auto text-center"
            >
              Sou Aluno
            </Link>
            <Link
              href="/personal"
              className="px-8 py-4 border-2 border-zinc-700 hover:border-yellow-500 text-white font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 w-full sm:w-auto text-center"
            >
              Sou Personal
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="py-8 bg-black border-t border-zinc-900 text-center">
        <a
          href="https://wa.me/5511914007287"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 text-xs hover:text-yellow-500 transition-colors uppercase tracking-widest"
        >
          &copy; 2026 Gabriel Gouvea &bull; Gouvea Automações
        </a>
      </footer>
    </main>
  );
}
