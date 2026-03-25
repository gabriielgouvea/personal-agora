import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Bell,
  Wallet,
  DollarSign,
  Shield,
  Users,
  CheckCircle2,
  TrendingUp,
  Megaphone,
  Handshake,
  CalendarCheck,
  Zap,
  BadgeCheck,
  Star,
  Crown,
  Rocket,
  Ticket,
  Gift,
} from "lucide-react";

export default function PersonalPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black overflow-hidden relative">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[1000px] h-[600px] bg-yellow-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* ───────── NAVBAR ───────── */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold italic uppercase tracking-tighter">
            Personal <span className="text-yellow-500">Agora</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/aluno" className="text-sm font-medium text-zinc-400 hover:text-white transition">
              Sou Aluno
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
            PARA PERSONAL TRAINERS
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6">
            Receba alunos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              sem esforço.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10">
            Cadastre-se gratuitamente, defina seu preço e receba notificações em tempo real quando
            alunos da sua região precisarem de um personal. O pagamento é{" "}
            <strong className="text-yellow-500">100% garantido pela plataforma</strong>.
          </p>

          <Link
            href="/cadastro/personal"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Fazer Pré-Cadastro Gratuito
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ───────── COMO VOCÊ RECEBE ALUNOS ───────── */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">
              De onde vêm os alunos?
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mt-3">
              A gente cuida da <span className="text-yellow-500">captação</span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Você foca em dar treinos. Nós focamos em trazer alunos até você.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Megaphone,
                title: "Tráfego Pago",
                desc: "Investimos em anúncios para atrair alunos da região de Alphaville diretamente para a plataforma. Você aparece nos resultados.",
              },
              {
                icon: Handshake,
                title: "Networking & Parcerias",
                desc: "Parcerias com academias, estúdios e condomínios da região. Quanto mais parceiros, mais alunos encontram você.",
              },
              {
                icon: Users,
                title: "Indicações & Recomendações",
                desc: "Alunos satisfeitos recomendam a plataforma. Avaliações positivas fazem seu perfil subir no ranking.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-yellow-500/30 transition-all group"
              >
                <Icon className="w-10 h-10 text-yellow-500 mb-5 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── COMO FUNCIONA ───────── */}
      <section className="py-20 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Passo a passo</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mt-3">
              Como <span className="text-yellow-500">funciona</span> pra você
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: BadgeCheck,
                title: "Cadastre-se",
                desc: "Preencha seu perfil com foto, CREF, academias e região. É gratuito. Nosso time aprova manualmente.",
              },
              {
                step: 2,
                icon: Bell,
                title: "Receba Notificações",
                desc: "Quando um aluno buscar um personal na sua academia ou região, você é notificado em tempo real.",
              },
              {
                step: 3,
                icon: CalendarCheck,
                title: "Aceite a Aula",
                desc: "Aceite aulas avulsas imediatas ou propostas de plano mensal. Você decide o que faz sentido.",
              },
              {
                step: 4,
                icon: Wallet,
                title: "Receba o Pagamento",
                desc: "O aluno paga pela plataforma. Você recebe o valor na sua conta no mesmo dia. Sem burocracia.",
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

      {/* ───────── PLANOS ───────── */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14">
            <DollarSign className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
              Escolha seu <span className="text-yellow-500">plano</span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Quanto mais alto o plano, mais visibilidade e vantagens você tem na plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Start */}
            <div className="relative p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="w-8 h-8 text-zinc-400" />
                <h3 className="text-2xl font-black uppercase italic">Start</h3>
              </div>
              <div className="mb-6">
                <p className="text-4xl font-black text-white">
                  R$ 29<span className="text-2xl">,90</span>
                  <span className="text-sm text-zinc-500 font-normal">/mês</span>
                </p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  Contratos ilimitados
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  12% sobre aulas/pacotes contratados e pagos no site
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  Perfil verificado (CREF + selfie)
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  Avaliações verificadas após aula
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  Newsletter da plataforma
                </li>
                <li className="flex gap-2 text-sm text-zinc-300 items-start">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <span>
                    10% OFF em 1 landing page com a Ascora{" "}
                    <span className="relative inline-block group/tip">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-700 text-zinc-400 text-[10px] font-bold cursor-help leading-none">?</span>
                      <span className="pointer-events-none group-hover/tip:pointer-events-auto invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 leading-relaxed shadow-xl z-30">
                        Desconto válido enquanto a assinatura estiver ativa. Limitado a 1 landing page (1 página) por personal. O desconto aplica-se ao valor final do projeto de 1 página. Itens extras podem alterar o valor final, mas o percentual de desconto se mantém.
                      </span>
                    </span>
                  </span>
                </li>
              </ul>
              <Link
                href="/cadastro/personal"
                className="block text-center py-3 border border-zinc-600 text-zinc-300 font-bold rounded-full hover:border-zinc-400 transition"
              >
                Selecionar
              </Link>
            </div>

            {/* Pro (destaque) */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-yellow-500/10 to-zinc-900/60 border-2 border-yellow-500/50 hover:border-yellow-500 transition-all flex flex-col scale-[1.02]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-black text-xs font-black uppercase rounded-full">
                Recomendado
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-8 h-8 text-yellow-500" />
                <h3 className="text-2xl font-black uppercase italic text-yellow-500">Pro</h3>
              </div>
              <div className="mb-6">
                <p className="text-4xl font-black text-white">
                  R$ 49<span className="text-2xl">,90</span>
                  <span className="text-sm text-zinc-500 font-normal">/mês</span>
                </p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Contratos ilimitados
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  9% sobre aulas/pacotes contratados e pagos no site
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Perfil verificado (CREF + selfie)
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Avaliações verificadas após aula
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Newsletter
                </li>
                <li className="flex gap-2 text-sm text-zinc-300 items-start">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>
                    20% OFF em 1 landing page com a Ascora{" "}
                    <span className="relative inline-block group/tip">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-700 text-zinc-400 text-[10px] font-bold cursor-help leading-none">?</span>
                      <span className="pointer-events-none group-hover/tip:pointer-events-auto invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 leading-relaxed shadow-xl z-30">
                        Desconto válido enquanto a assinatura estiver ativa. Limitado a 1 landing page (1 página) por personal. O desconto aplica-se ao valor final do projeto de 1 página. Itens extras podem alterar o valor final, mas o percentual de desconto se mantém.
                      </span>
                    </span>
                  </span>
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Especialidades: até 3
                </li>
              </ul>
              <Link
                href="/cadastro/personal"
                className="block text-center py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition hover:scale-[1.02] active:scale-95"
              >
                Selecionar
              </Link>
            </div>

            {/* Elite */}
            <div className="relative p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-yellow-500/30 transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-500" />
                <h3 className="text-2xl font-black uppercase italic">Elite</h3>
              </div>
              <div className="mb-6">
                <p className="text-4xl font-black text-white">
                  R$ 99<span className="text-2xl">,90</span>
                  <span className="text-sm text-zinc-500 font-normal">/mês</span>
                </p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Contratos ilimitados
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  7% sobre aulas/pacotes contratados e pagos no site
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Perfil verificado (CREF + selfie)
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Avaliações verificadas após aula
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Newsletter
                </li>
                <li className="flex gap-2 text-sm text-zinc-300 items-start">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>
                    40% OFF em 1 landing page com a Ascora{" "}
                    <span className="relative inline-block group/tip">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-700 text-zinc-400 text-[10px] font-bold cursor-help leading-none">?</span>
                      <span className="pointer-events-none group-hover/tip:pointer-events-auto invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 leading-relaxed shadow-xl z-30">
                        Desconto válido enquanto a assinatura estiver ativa. Limitado a 1 landing page (1 página) por personal. O desconto aplica-se ao valor final do projeto de 1 página. Itens extras podem alterar o valor final, mas o percentual de desconto se mantém.
                      </span>
                    </span>
                  </span>
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Especialidades: ilimitadas
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Suporte prioritário
                </li>
                <li className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  Perfil em destaque (badge &quot;Destaque&quot;)
                </li>
              </ul>
              <Link
                href="/cadastro/personal"
                className="block text-center py-3 border border-yellow-500/50 text-yellow-500 font-bold rounded-full hover:bg-yellow-500/10 transition"
              >
                Selecionar
              </Link>
            </div>
          </div>

          {/* Convite + Cupom */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <Gift className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-zinc-300">Tem um convite?</span>
              <Link
                href="/cadastro/personal?convite=1"
                className="text-sm text-yellow-500 font-bold hover:text-yellow-400 transition"
              >
                2 meses grátis no Pro →
              </Link>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <Ticket className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-zinc-300">Tem cupom de desconto?</span>
              <Link
                href="/cadastro/personal?cupom=1"
                className="text-sm text-yellow-500 font-bold hover:text-yellow-400 transition"
              >
                Aplicar cupom →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── VANTAGENS ───────── */}
      <section className="py-20 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-center mb-12">
            Vantagens de estar na <span className="text-yellow-500">plataforma</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              "Planos a partir de R$ 29,90/mês — acessível para todo personal",
              "Você define o preço da sua aula e dos pacotes",
              "Pagamento garantido — não precisa cobrar o aluno",
              "Dinheiro na conta em até 24h",
              "Perfil verificado com CREF + selfie",
              "Alunos chegam via tráfego pago e networking — sem esforço seu",
              "Desconto exclusivo em landing page profissional com a Ascora",
              "Avaliações verificadas: só quem fez aula pode avaliar",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-yellow-500/20 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <span className="text-zinc-300 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PRIVACIDADE ───────── */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic mb-6">
            Seus dados estão <span className="text-yellow-500">protegidos</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Antes do pagamento, o aluno só vê seu <strong className="text-zinc-200">primeiro nome</strong>,{" "}
            <strong className="text-zinc-200">foto</strong> e{" "}
            <strong className="text-zinc-200">descrição</strong>. Nenhuma rede social, telefone ou WhatsApp
            aparece sem que o aluno tenha pago. Isso protege você de contatos indesejados e garante que
            todo cliente que chegar é um cliente pagante.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-medium">
            <Zap className="w-4 h-4" />
            Contato liberado somente após pagamento confirmado
          </div>
        </div>
      </section>

      {/* ───────── CTA FINAL ───────── */}
      <section className="py-20 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mb-6">
            Lote sua <span className="text-yellow-500">agenda</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Cadastre-se gratuitamente e esteja entre os primeiros personais da plataforma em Alphaville.
          </p>
          <Link
            href="/cadastro/personal"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Fazer Pré-Cadastro Gratuito
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-zinc-600 text-sm mt-4">Sem custos. Sem cartão de crédito.</p>
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
