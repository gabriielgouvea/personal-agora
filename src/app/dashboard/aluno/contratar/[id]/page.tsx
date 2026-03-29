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
  Ticket,
  Star,
  ExternalLink,
  ScanFace,
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
  cref: string | null;
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

  // Cartão de crédito state
  const [cardForm, setCardForm] = useState({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
    cpf: "",
  });
  const [souTitular, setSouTitular] = useState(false);
  const [alunoProfile, setAlunoProfile] = useState<{
    cpf: string | null;
    cep: string | null;
    numero: string | null;
    telefone: string | null;
    nome: string;
    sobrenome: string;
    email: string;
  } | null>(null);
  const [cardResult, setCardResult] = useState<{
    success: boolean;
    status: string;
    aulaId: string;
  } | null>(null);

  // Cupom state
  const [showCupom, setShowCupom] = useState(false);
  const [cupomInput, setCupomInput] = useState("");
  const [cupomStatus, setCupomStatus] = useState<{
    valido?: boolean;
    descricao?: string;
    codigo?: string;
    tipo?: string;
    valor?: number;
    erro?: string;
  }>({});
  const [validandoCupom, setValidandoCupom] = useState(false);

  // Avaliações
  const [avaliacoes, setAvaliacoes] = useState<{
    avaliacoes: { id: string; nota: number; comentario: string | null; createdAt: string; autor: { nome: string; avatarUrl: string | null } }[];
    media: number;
    total: number;
  }>({ avaliacoes: [], media: 0, total: 0 });

  useEffect(() => {
    fetch(`/api/personais/${personalId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setPersonal)
      .catch(() => setError("Personal não encontrado."))
      .finally(() => setLoading(false));
    // Busca perfil do aluno para auto-preencher dados do titular
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setAlunoProfile(data);
      })
      .catch(() => {});
    // Busca avaliações públicas do personal
    fetch(`/api/avaliacoes/personal/${personalId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setAvaliacoes(data); })
      .catch(() => {});
  }, [personalId]);

  // Quando marca "sou titular", preenche CPF do perfil
  useEffect(() => {
    if (souTitular && alunoProfile?.cpf) {
      setCardForm((prev) => ({ ...prev, cpf: alunoProfile.cpf!.replace(/\D/g, "") }));
    } else if (!souTitular) {
      setCardForm((prev) => ({ ...prev, cpf: "" }));
    }
  }, [souTitular, alunoProfile]);

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

  function handleCardInput(field: string, value: string) {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  }

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  async function validarCupom() {
    if (!cupomInput.trim()) return;
    setValidandoCupom(true);
    setCupomStatus({});
    try {
      const res = await fetch("/api/cupom/aplicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: cupomInput.toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCupomStatus({ valido: true, descricao: data.descricao, codigo: data.codigo, tipo: data.tipo, valor: data.valor });
      } else {
        setCupomStatus({ erro: data.error || "Cupom inválido" });
      }
    } catch {
      setCupomStatus({ erro: "Erro ao validar cupom" });
    } finally {
      setValidandoCupom(false);
    }
  }

  function calcularValorComDesconto(): number {
    const v = parseFloat(personal?.valorAproximado?.replace(/[^0-9,\.]/g, "").replace(",", ".") ?? "0");
    if (!cupomStatus.valido || !cupomStatus.valor) return v;
    if (cupomStatus.tipo === "percentual") {
      return parseFloat((v * (1 - cupomStatus.valor / 100)).toFixed(2));
    }
    return parseFloat(Math.max(v - cupomStatus.valor, 0).toFixed(2));
  }

  async function handleContratar() {
    setContratando(true);
    setError("");
    try {
      // 1. Cria aula
      const res = await fetch("/api/aulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalId,
          billingType,
          codigoCupom: cupomStatus.valido ? cupomStatus.codigo : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar cobrança.");
        return;
      }

      if (billingType === "CREDIT_CARD") {
        // 2a. Paga com cartão
        const cardNum = cardForm.number.replace(/\s/g, "");
        if (cardNum.length < 13 || cardNum.length > 19) {
          setError("Número do cartão inválido.");
          return;
        }
        if (!cardForm.holderName.trim()) {
          setError("Nome do titular obrigatório.");
          return;
        }
        if (!cardForm.expiryMonth || !cardForm.expiryYear) {
          setError("Data de validade obrigatória.");
          return;
        }
        if (cardForm.ccv.length < 3) {
          setError("CVV inválido.");
          return;
        }

        const cardRes = await fetch(`/api/aulas/${data.aulaId}/pagar-cartao`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creditCard: {
              holderName: cardForm.holderName.trim(),
              number: cardNum,
              expiryMonth: cardForm.expiryMonth,
              expiryYear: cardForm.expiryYear,
              ccv: cardForm.ccv,
            },
          }),
        });
        const cardData = await cardRes.json();
        if (!cardRes.ok) {
          setError(cardData.error || "Erro ao processar cartão.");
          return;
        }

        setCardResult({
          success: cardData.paid || cardData.status === "CONFIRMED" || cardData.status === "RECEIVED",
          status: cardData.status,
          aulaId: data.aulaId,
        });

        if (cardData.paid) {
          setTimeout(() => {
            router.push(`/dashboard/aluno/aulas/sucesso?aulaId=${data.aulaId}`);
          }, 2500);
        }
        return;
      }

      // 2b. PIX — busca QR Code
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
              {avaliacoes.total > 0 && (
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400">{avaliacoes.media.toFixed(1)}</span>
                  <span className="text-xs text-zinc-500">({avaliacoes.total})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Identidade e CREF verificados */}
        {personal && !pixData && !cardResult && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400 mb-4">
              Verificação de identidade
            </h3>
            <div className="flex flex-col gap-3">
              {/* CREF */}
              {personal.cref && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      CREF: <span className="text-yellow-400 font-mono">{personal.cref}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Registro ativo conferido pela nossa equipe.
                    </p>
                    <a
                      href={`https://www.confef.org.br/confefv2/registrados/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300 transition underline underline-offset-2"
                    >
                      Validar no site oficial do CONFEF
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
              {/* Identidade */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <ScanFace className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Identidade validada pela plataforma</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Foto do documento e reconhecimento facial verificados
                    pela equipe <span className="text-yellow-500 font-semibold">Personal Agora</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avaliações de alunos */}
        {avaliacoes.total > 0 && !pixData && !cardResult && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Avaliações de alunos
              <span className="text-sm font-normal text-zinc-500">({avaliacoes.total})</span>
            </h3>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800">
              <span className="text-3xl font-black text-yellow-400">{avaliacoes.media.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-5 h-5 ${avaliacoes.media >= n ? "text-yellow-400 fill-yellow-400" : avaliacoes.media >= n - 0.5 ? "text-yellow-400 fill-yellow-400/50" : "text-zinc-700"}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {avaliacoes.avaliacoes.map((av) => (
                <div key={av.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {av.autor.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={av.autor.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-yellow-500">{av.autor.nome[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">{av.autor.nome}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`w-3 h-3 ${av.nota >= n ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-600">{new Date(av.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {av.comentario && (
                      <p className="text-sm text-zinc-400">{av.comentario}</p>
                    )}
                  </div>
                </div>
              ))}
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

        {/* Cartão — Resultado */}
        {cardResult && (
          <div className={`bg-zinc-900 border rounded-2xl p-8 text-center ${
            cardResult.success ? "border-green-500/30" : "border-yellow-500/30"
          }`}>
            {cardResult.success ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="font-bold text-2xl text-green-400 mb-2">Pagamento aprovado!</h3>
                <p className="text-zinc-400">Redirecionando...</p>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="font-bold text-2xl text-yellow-400 mb-2">Pagamento em processamento</h3>
                <p className="text-zinc-400 text-sm">Seu pagamento está sendo analisado. Você será notificado quando for confirmado.</p>
                <button
                  onClick={() => router.push("/dashboard/aluno/aulas")}
                  className="mt-4 px-6 py-2 bg-zinc-800 rounded-xl text-sm hover:bg-zinc-700 transition"
                >
                  Ver minhas aulas
                </button>
              </>
            )}
          </div>
        )}

        {/* Resumo da compra — só mostra se PIX NÃO está exibido e cartão não processado */}
        {personal && !pixData && !cardResult && (
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
                <span className="text-sm font-medium">Aula avulsa</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-400 text-sm font-semibold">Total</span>
                <div className="text-right">
                  {cupomStatus.valido ? (
                    <>
                      <span className="text-sm text-zinc-500 line-through mr-2">
                        R$ {personal.valorAproximado}
                      </span>
                      <span className="text-2xl font-black text-green-400">
                        R$ {calcularValorComDesconto().toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-black text-yellow-400">
                      R$ {personal.valorAproximado ?? "—"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cupom de desconto */}
            <div className="mt-4">
              {!showCupom ? (
                <button
                  onClick={() => setShowCupom(true)}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-yellow-400 transition"
                >
                  <Ticket className="w-4 h-4" />
                  Tenho um cupom de desconto
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 block">Cupom de desconto</label>
                  {cupomStatus.valido ? (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-sm text-green-400 font-medium flex-1">{cupomStatus.descricao}</span>
                      <button
                        onClick={() => { setCupomStatus({}); setCupomInput(""); }}
                        className="text-xs text-zinc-500 hover:text-red-400 transition"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="CÓDIGO DO CUPOM"
                        value={cupomInput}
                        onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:outline-none transition uppercase"
                      />
                      <button
                        onClick={validarCupom}
                        disabled={validandoCupom || !cupomInput.trim()}
                        className="px-4 py-3 bg-yellow-500 text-black font-bold rounded-xl text-sm hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validandoCupom ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                      </button>
                    </div>
                  )}
                  {cupomStatus.erro && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {cupomStatus.erro}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Forma de pagamento */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-zinc-300 mb-3">Como prefere pagar?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "PIX" as const, label: "PIX", icon: Smartphone, desc: "Aprovação instantânea" },
                  { id: "CREDIT_CARD" as const, label: "Cartão de crédito", icon: CreditCard, desc: "Pagamento na hora" },
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

            {/* Formulário do cartão de crédito */}
            {billingType === "CREDIT_CARD" && (
              <div className="mt-5 space-y-4 border-t border-zinc-800 pt-5">
                <p className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  Dados do cartão
                </p>

                {/* Número do cartão */}
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Número do cartão</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardForm.number}
                    onChange={(e) => handleCardInput("number", formatCardNumber(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:outline-none transition"
                  />
                </div>

                {/* Nome do titular */}
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Nome do titular (como no cartão)</label>
                  <input
                    type="text"
                    placeholder="NOME COMPLETO"
                    value={cardForm.holderName}
                    onChange={(e) => handleCardInput("holderName", e.target.value.toUpperCase())}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:outline-none transition"
                  />
                </div>

                {/* Validade + CVV */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Mês</label>
                    <select
                      value={cardForm.expiryMonth}
                      onChange={(e) => handleCardInput("expiryMonth", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-white focus:border-yellow-500 focus:outline-none transition"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Ano</label>
                    <select
                      value={cardForm.expiryYear}
                      onChange={(e) => handleCardInput("expiryYear", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-white focus:border-yellow-500 focus:outline-none transition"
                    >
                      <option value="">AAAA</option>
                      {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i)).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">CVV</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000"
                      maxLength={4}
                      value={cardForm.ccv}
                      onChange={(e) => handleCardInput("ccv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Checkbox sou titular */}
                <label className="flex items-center gap-3 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={souTitular}
                    onChange={(e) => setSouTitular(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-300">Sou o titular do cartão</span>
                </label>

                {/* CPF do titular — aparece se NÃO marcou "sou titular" */}
                {!souTitular && (
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">CPF do titular do cartão</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      value={cardForm.cpf}
                      onChange={(e) => handleCardInput("cpf", e.target.value.replace(/\D/g, "").slice(0, 11))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:outline-none transition"
                    />
                  </div>
                )}

                {souTitular && alunoProfile?.cpf && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    CPF do cadastro será usado automaticamente
                  </p>
                )}

                <p className="text-xs text-zinc-600 mt-1">
                  Ao confirmar, você autoriza a cobrança mensal automática neste cartão.
                  Cancele a qualquer momento na área de aulas.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Política de cancelamento */}
            <div className="mt-4 p-4 bg-zinc-800/60 border border-zinc-700 rounded-xl text-xs text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-300 text-sm mb-1">📋 Política de cancelamento</p>
              <p>• Cancele ou remarque <strong className="text-white">até 12h antes</strong> da aula sem custo.</p>
              <p>• Cancelamentos com <strong className="text-red-400">menos de 12h</strong> de antecedência são considerados aula realizada e <strong className="text-red-400">não geram reembolso</strong>.</p>
              <p>• Em caso de força maior (doença, acidente), entre em contato com o suporte com comprovante para análise.</p>
            </div>

            <button
              onClick={handleContratar}
              disabled={contratando}
              className="mt-5 w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-black text-lg rounded-xl transition flex items-center justify-center gap-2"
            >
              {contratando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : billingType === "PIX" ? (
                "Gerar PIX"
              ) : (
                "Pagar com cartão"
              )}
            </button>
          </div>
        )}

        {/* Vantagens de pagar pela plataforma — esconde quando PIX/cartão exibido */}
        {!pixData && !cardResult && (
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
        {!pixData && !cardResult && (
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
