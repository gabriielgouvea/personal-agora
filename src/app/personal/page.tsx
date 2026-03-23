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
            href="/cadastro"
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

      {/* ───────── MODELO FINANCEIRO ───────── */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-14">
            <DollarSign className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
              Quanto <span className="text-yellow-500">custa</span>?
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="p-8 md:p-10 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-center mb-8">
                <p className="text-5xl md:text-6xl font-black text-yellow-500 mb-2">R$ 0</p>
                <p className="text-zinc-400 text-lg">para se cadastrar e manter seu perfil</p>
              </div>

              <div className="border-t border-zinc-700 pt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Comissão de 20% por aula</h4>
                    <p className="text-zinc-400 leading-relaxed">
                      Você só paga quando ganha. A plataforma retém <strong className="text-zinc-200">20%</strong>{" "}
                      do valor de cada transação. Se você não faz aulas, não paga nada. Sem mensalidade,
                      sem taxa de adesão, sem surpresas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Dinheiro na conta no mesmo dia</h4>
                    <p className="text-zinc-400 leading-relaxed">
                      Após a confirmação do pagamento do aluno, você recebe o valor líquido (80%){" "}
                      <strong className="text-zinc-200">em até 24 horas</strong>. Direto na sua conta bancária.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Pagamento é responsabilidade da plataforma</h4>
                    <p className="text-zinc-400 leading-relaxed">
                      Você nunca precisa cobrar o aluno. A plataforma cuida de cobrança, nota fiscal e repasse.
                      Foque no que importa: dar treinos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Example */}
              <div className="mt-8 p-5 rounded-xl bg-zinc-800/50 border border-zinc-700">
                <p className="text-sm text-zinc-400 font-medium mb-3">Exemplo:</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Valor da aula</p>
                    <p className="text-white font-bold text-lg">R$ 150</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Comissão (20%)</p>
                    <p className="text-zinc-400 font-bold text-lg">R$ 30</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Você recebe</p>
                    <p className="text-yellow-500 font-bold text-lg">R$ 120</p>
                  </div>
                </div>
              </div>
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
              "Cadastro 100% gratuito — sem mensalidade",
              "Você define o preço da sua aula e dos planos",
              "Recebe notificações em tempo real de alunos na sua região",
              "Aulas avulsas imediatas e fechamento de planos mensais",
              "Pagamento garantido — não precisa cobrar o aluno",
              "Dinheiro na conta em até 24h",
              "Selo de verificação com CREF conferido",
              "Alunos chegam via tráfego pago e networking — sem esforço seu",
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
            href="/cadastro"
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
