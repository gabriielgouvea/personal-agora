"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  RefreshCw,
  BadgeCheck,
  ArrowLeft,
  Loader2,
  Home,
  MapPin,
  CreditCard,
  Smartphone,
  AlertCircle,
  Lock,
} from "lucide-react";

interface Personal {
  id: string;
  nome: string;
  sobrenome: string;
  avatarUrl: string | null;
  modalidades: string | null;
  valorAproximado: string | null;
  disponivelEmCasa: boolean;
  regioes: string | null;
}

function parseJson(str: string | null): string[] {
  if (!str) return [];
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

const VANTAGENS = [
  {
    icon: ShieldCheck,
    cor: "yellow",
    titulo: "Pagamento seguro e protegido",
    descricao:
      "Seu dinheiro fica retido na plataforma até você confirmar que a aula aconteceu. Nada é liberado antes disso.",
  },
  {
    icon: RefreshCw,
    cor: "blue",
    titulo: "Reembolso se o personal não aparecer",
    descricao:
      "Caso o personal não compareça ou cancele em cima da hora, você recebe seu dinheiro de volta integralmente.",
  },
  {
    icon: Lock,
    cor: "green",
    titulo: "Você tem o controle",
    descricao:
      "Só após você clicar em &ldquo;Aula realizada&rdquo; o pagamento é liberado ao personal. Se algo der errado, abra uma contestação.",
  },
  {
    icon: BadgeCheck,
    cor: "purple",
    titulo: "Personais verificados",
    descricao:
      "Todos os profissionais na plataforma têm CREF e documentação verificados pela nossa equipe.",
  },
];

export default function ContratarPage() {
  const params = useParams();
  const router = useRouter();
  const personalId = params.id as string;

  const [personal, setPersonal] = useState<Personal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contratando, setContratando] = useState(false);
  const [billingType, setBillingType] = useState<"PIX" | "CREDIT_CARD">("PIX");

  useEffect(() => {
    fetch(`/api/personais/${personalId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setPersonal)
      .catch(() => setError("Personal não encontrado."))
      .finally(() => setLoading(false));
  }, [personalId]);

  async function handleContratar() {
    setContratando(true);
    setError("");
    try {
      const res = await fetch("/api/aulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalId, billingType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar cobrança.");
        return;
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // Se não tiver URL de pagamento, redirecionar para a página de aulas
        router.push("/dashboard/aluno/aulas");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setContratando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !personal) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-zinc-400">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-zinc-800 rounded-xl text-sm hover:bg-zinc-700 transition"
        >
          Voltar
        </button>
      </div>
    );
  }

  const modalidades = parseJson(personal?.modalidades ?? null);
  const regioes = parseJson(personal?.regioes ?? null);
  const initials = personal ? personal.nome[0].toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-3xl mx-auto flex items-center gap-4 h-16 px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <h1 className="font-bold text-base">Contratar aula avulsa</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Card do personal */}
        {personal && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center">
              {personal.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={personal.avatarUrl} alt={personal.nome} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-yellow-500">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl">{personal.nome}</h2>
              {modalidades.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {modalidades.slice(0, 3).map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20">
                      {m}
                    </span>
                  ))}
                </div>
              )}
              {regioes.length > 0 && (
                <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {regioes.slice(0, 2).join(", ")}
                </p>
              )}
              {personal.disponivelEmCasa && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <Home className="w-3 h-3" /> Disponível para aulas em casa
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-yellow-400">
                <BadgeCheck className="w-4 h-4" />
                <span className="text-xs font-semibold text-zinc-400">Verificado</span>
              </div>
            </div>
          </div>
        )}

        {/* Resumo da compra */}
        {personal && (
          <div className="bg-zinc-900 border border-yellow-500/30 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              Resumo da contratação
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400 text-sm">Serviço</span>
                <span className="text-sm font-medium">1 aula com {personal.nome}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400 text-sm">Tipo</span>
                <span className="text-sm font-medium">Aula avulsa (não é pacote)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-400 text-sm font-semibold">Total</span>
                <span className="text-2xl font-black text-yellow-400">
                  R$ {personal.valorAproximado ?? "—"}
                </span>
              </div>
            </div>

            {/* Forma de pagamento */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-zinc-300 mb-3">Como prefere pagar?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "PIX" as const, label: "PIX", icon: Smartphone, desc: "Aprovação instantânea" },
                  { id: "CREDIT_CARD" as const, label: "Cartão de crédito", icon: CreditCard, desc: "Parcelamento disponível" },
                ].map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setBillingType(id)}
                    className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border text-center transition ${
                      billingType === id
                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-xs opacity-60">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleContratar}
              disabled={contratando}
              className="mt-5 w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-black text-lg rounded-xl transition flex items-center justify-center gap-2"
            >
              {contratando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Aguarde...
                </>
              ) : (
                "Ir para pagamento"
              )}
            </button>
            <p className="text-center text-xs text-zinc-600 mt-3">
              Você será redirecionado para o ambiente seguro de pagamento Asaas.
            </p>
          </div>
        )}

        {/* Vantagens de pagar pela plataforma */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-center">
            Por que pagar pela <span className="text-yellow-500">plataforma</span>?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VANTAGENS.map(({ icon: Icon, titulo, descricao, cor }) => {
              const colorMap: Record<string, string> = {
                yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
                blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                green: "bg-green-500/10 border-green-500/20 text-green-400",
                purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
              };
              return (
                <div
                  key={titulo}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colorMap[cor]}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white mb-1">{titulo}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aviso de segurança */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Pagamento totalmente seguro</p>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Processamos os pagamentos via <strong className="text-white">Asaas</strong>, plataforma homologada pelo Banco Central do Brasil. Seus dados financeiros são protegidos com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
