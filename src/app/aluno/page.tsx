import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  MapPin,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  MessageCircle,
  CheckCircle2,
  Clock,
  Dumbbell,
  Star,
} from "lucide-react";

export default function AlunoPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black overflow-hidden relative">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-yellow-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* ───────── NAVBAR ───────── */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold italic uppercase tracking-tighter">
            Personal <span className="text-yellow-500">Agora</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/personal" className="text-sm font-medium text-zinc-400 hover:text-white transition">
              Sou Personal
            </Link>
          </nav>
        </div>
      </header>

      {/* ───────── HERO ───────── */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 px-6">
        <div className="container mx-auto max-w-4xl z-10 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-6">
            PARA ALUNOS
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6">
            Encontre o Personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              certo pra você.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Busque por academia ou região em Alphaville, veja os profissionais disponíveis e agende sua aula —
            tudo com pagamento seguro pela plataforma.
          </p>
        </div>
      </section>

      {/* ───────── COMO FUNCIONA PRO ALUNO ───────── */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Passo a passo</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mt-3">
              Sua jornada no <span className="text-yellow-500">Personal Agora</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: Search,
                title: "Busque",
                desc: "Escolha a academia ou região onde quer treinar. Veja todos os personais disponíveis ali.",
              },
              {
                step: 2,
                icon: Eye,
                title: "Compare",
                desc: "Veja o primeiro nome, foto, descrição e preço de cada personal. Sem contato até pagar — para sua segurança.",
              },
              {
                step: 3,
                icon: CreditCard,
                title: "Pague",
                desc: "Escolha aula avulsa ou plano mensal. O pagamento é 100% pela plataforma — seguro e rápido.",
              },
              {
                step: 4,
                icon: MessageCircle,
                title: "Conecte-se",
                desc: "Após a confirmação do pagamento, WhatsApp e dados de contato são liberados para vocês dois.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-yellow-500/30 transition-all group"
              >
                <div className="absolute -top-3 -left-2 w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-black text-sm">
                  {step}
                </div>
                <Icon className="w-8 h-8 text-yellow-500 mb-4 mt-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── O QUE VOCÊ VÊ ───────── */}
      <section className="py-20 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
              O que você vê <span className="text-yellow-500">antes</span> e{" "}
              <span className="text-yellow-500">depois</span>
            </h2>
            <p className="text-zinc-400 mt-3 max-w-xl mx-auto">
              Suas informações e as do personal ficam protegidas até o pagamento ser confirmado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Antes */}
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <EyeOff className="w-5 h-5 text-zinc-500" />
                <span className="text-sm font-bold uppercase tracking-wide text-zinc-500">
                  Antes do Pagamento
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  "Primeiro nome do personal",
                  "Foto de perfil",
                  "Descrição e especialidades",
                  "Preço da aula avulsa e planos",
                  "Avaliações de outros alunos",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <p className="text-zinc-500 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  WhatsApp, Instagram e telefone ficam ocultos
                </p>
              </div>
            </div>

            {/* Depois */}
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold uppercase tracking-wide text-yellow-500">
                  Após o Pagamento
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  "Nome completo do personal",
                  "WhatsApp liberado",
                  "Contato direto para combinar o treino",
                  "O personal também recebe seus dados",
                  "Acompanhamento via plataforma",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-yellow-500/80 text-xs flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Você e o personal podem se falar diretamente
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── VANTAGENS ───────── */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-center mb-12">
            Por que usar para <span className="text-yellow-500">encontrar seu personal</span>?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "Perto de Você",
                desc: "Filtre por academia ou bairro em Alphaville. Sem deslocamento longe.",
              },
              {
                icon: Dumbbell,
                title: "Aula Avulsa ou Plano",
                desc: "Precisa de um treino urgente hoje? Ou quer fechar um plano mensal? Tem as duas opções.",
              },
              {
                icon: Shield,
                title: "Pagamento Seguro",
                desc: "Toda transação passa pela plataforma. Você nunca paga direto pro personal — proteção total.",
              },
              {
                icon: Star,
                title: "Perfis Verificados",
                desc: "Todos os personais são aprovados manualmente. CREF conferido antes de ir ao ar.",
              },
              {
                icon: CreditCard,
                title: "Preço Transparente",
                desc: "O valor da aula é definido pelo personal e visível antes de fechar. Sem surpresas.",
              },
              {
                icon: Clock,
                title: "Notificação em Tempo Real",
                desc: "Precisa de uma aula agora? Personais disponíveis na sua região são notificados na hora.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-yellow-500/20 transition-all group"
              >
                <Icon className="w-7 h-7 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white mb-2">{title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA FINAL ───────── */}
      <section className="py-20 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mb-6">
            Pronto pra <span className="text-yellow-500">treinar</span>?
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Em breve você vai poder buscar, comparar e contratar o melhor personal da sua região —
            direto pelo celular.
          </p>
          <Link
            href="/cadastro/aluno"
            className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Criar Minha Conta
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="py-8 bg-black border-t border-zinc-900 text-center">
        <a
          href="https://www.instagram.com/ascoracompany"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 text-xs hover:text-yellow-500 transition-colors uppercase tracking-widest"
        >
          &copy; 2026 Ascora Company
        </a>
      </footer>
    </main>
  );
}
