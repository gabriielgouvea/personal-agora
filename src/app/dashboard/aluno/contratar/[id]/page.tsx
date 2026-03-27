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
  Copy,
  CheckCircle2,
  Clock,
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

  // PIX inline state
  const [pixData, setPixData] = useState<{
    aulaId: string;
    qrCodeImage: string;
    qrCodeText: string;
    expirationDate: string;
  } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [pixStatus, setPixStatus] = useState<string>("aguardando_pagamento");

  useEffect(() => {
    fetch(`/api/personais/${personalId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setPersonal)
      .catch(() => setError("Personal não encontrado."))
      .finally(() => setLoading(false));
  }, [personalId]);

  // Polling de status quando PIX está exibido
  useEffect(() => {
    if (!pixData) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/aulas/${pixData.aulaId}/status`);
        const data = await res.json();
        if (data.status && data.status !== "aguardando_pagamento") {
          setPixStatus(data.status);
          clearInterval(interval);
          // Redireciona após 2s para o aluno ver a confirmação
          setTimeout(() => {
            router.push(`/dashboard/aluno/aulas/sucesso?aulaId=${pixData.aulaId}`);
          }, 2000);
        }
      } catch { /* silencia erros de polling */ }
    }, 4000); // A cada 4 segundos
    return () => clearInterval(interval);
  }, [pixData, router]);

  async function handleCopiarPix() {
    if (!pixData) return;
    await navigator.clipboard.writeText(pixData.qrCodeText);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

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

      // Se cartão, redireciona para Asaas (por enquanto)
      if (billingType === "CREDIT_CARD") {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          router.push("/dashboard/aluno/aulas");
        }
        return;
      }

      // Se PIX, busca o QR Code
      const pixRes = await fetch(`/api/aulas/${data.aulaId}/pix`);
      const pixJson = await pixRes.json();
      if (!pixRes.ok) {
        setError(pixJson.error || "Erro ao gerar QR Code PIX.");
        return;
      }

      setPixData({
        aulaId: data.aulaId,
        qrCodeImage: pixJson.qrCodeImage,
        qrCodeText: pixJson.qrCodeText,
        expirationDate: pixJson.expirationDate,
      });
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

        {/* ── PIX QR Code inline ── */}
        {pixData && pixStatus === "aguardando_pagamento" && (
          <div className="bg-zinc-900 border border-yellow-500/30 rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-4">
                <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-sm font-semibold text-yellow-400">Aguardando pagamento</span>
              </div>
              <h3 className="font-bold text-xl">Pague com PIX</h3>
              <p className="text-zinc-400 text-sm mt-1">Escaneie o QR Code ou copie o código abaixo</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${pixData.qrCodeImage}`}
                  alt="QR Code PIX"
                  className="w-56 h-56"
                />
              </div>
            </div>

            {/* Valor */}
            <div className="text-center mb-6">
              <p className="text-zinc-400 text-sm">Valor</p>
              <p className="text-3xl font-black text-yellow-400">
                R$ {personal?.valorAproximado ?? "—"}
              </p>
            </div>

            {/* Código Copia e Cola */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-4">
              <p className="text-xs text-zinc-400 mb-2 font-semibold">Pix Copia e Cola</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixData.qrCodeText}
                  className="flex-1 bg-zinc-900 text-zinc-300 text-xs py-2 px-3 rounded-lg border border-zinc-700 truncate"
                />
                <button
                  onClick={handleCopiarPix}
                  className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition shrink-0 ${
                    copiado
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-yellow-500 text-black hover:bg-yellow-400"
                  }`}
                >
                  {copiado ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex items-start gap-3">
              <Loader2 className="w-5 h-5 text-yellow-500 animate-spin shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-300">Confirmação automática</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Após o pagamento, esta página será atualizada automaticamente. Não feche esta aba.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PIX Confirmado */}
        {pixData && pixStatus !== "aguardando_pagamento" && (
          <div className="bg-zinc-900 border border-green-500/30 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="font-bold text-2xl text-green-400 mb-2">Pagamento confirmado!</h3>
            <p className="text-zinc-400">Redirecionando...</p>
          </div>
        )}

        {/* Resumo da compra — só mostra se PIX NÃO está exibido */}
        {personal && !pixData && (
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
              ) : billingType === "PIX" ? (
                "Gerar PIX"
              ) : (
                "Ir para pagamento"
              )}
            </button>
            {billingType === "CREDIT_CARD" && (
              <p className="text-center text-xs text-zinc-600 mt-3">
                Você será redirecionado para o ambiente seguro de pagamento Asaas.
              </p>
            )}
          </div>
        )}

        {/* Vantagens de pagar pela plataforma — esconde quando PIX exibido */}
        {!pixData && (
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
        )}

        {/* Aviso de segurança */}
        {!pixData && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Pagamento totalmente seguro</p>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Processamos os pagamentos via <strong className="text-white">Asaas</strong>, plataforma homologada pelo Banco Central do Brasil. Seus dados financeiros são protegidos com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
