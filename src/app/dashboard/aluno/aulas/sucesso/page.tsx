"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  MessageCircle,
  Loader2,
  Clock,
  Home,
  ArrowRight,
} from "lucide-react";

interface Aula {
  id: string;
  valor: number;
  status: string;
  personal: {
    id: string;
    nome: string;
    sobrenome: string;
    avatarUrl: string | null;
    telefone: string | null;
    isWhatsapp: boolean;
  };
}

export default function AulaSucessoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const aulaId = searchParams.get("aulaId");

  const [aula, setAula] = useState<Aula | null>(null);
  const [status, setStatus] = useState<"loading" | "paga" | "aguardando" | "erro">("loading");

  useEffect(() => {
    if (!aulaId) { setStatus("erro"); return; }

    // Busca com retry — webhook pode demorar alguns segundos
    let attempts = 0;
    const maxAttempts = 8;

    async function poll() {
      try {
        const res = await fetch(`/api/aulas/${aulaId}`);
        if (!res.ok) { setStatus("erro"); return; }
        const data: Aula = await res.json();
        setAula(data);

        if (data.status === "paga" || data.status === "confirmada") {
          setStatus("paga");
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2500);
        } else {
          // Mesmo sem confirmação do webhook, mostra a tela de aguardo
          setStatus("aguardando");
        }
      } catch {
        setStatus("erro");
      }
    }

    poll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aulaId]);

  const whatsappUrl =
    aula?.personal.isWhatsapp && aula.personal.telefone
      ? `https://wa.me/55${aula.personal.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
          `Olá ${aula.personal.nome}! Acabei de contratar uma aula com você pelo Personal Agora. Podemos combinar os detalhes?`
        )}`
      : null;

  const initials = aula?.personal.nome[0].toUpperCase() ?? "?";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
        <p className="text-zinc-400 text-sm">Confirmando seu pagamento...</p>
      </div>
    );
  }

  if (status === "erro") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-zinc-400">Não foi possível carregar os detalhes da aula.</p>
        <button
          onClick={() => router.push("/dashboard/aluno/aulas")}
          className="px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-xl text-sm"
        >
          Ver minhas aulas
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        {/* Ícone de sucesso */}
        <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
          {status === "paga" ? (
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          ) : (
            <Clock className="w-10 h-10 text-yellow-500" />
          )}
        </div>

        {/* Título */}
        <div className="text-center">
          <h1 className="text-2xl font-black mb-2">
            {status === "paga" ? "Pagamento confirmado! 🎉" : "Pagamento realizado!"}
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {status === "paga"
              ? "Sua aula foi reservada com sucesso."
              : "Estamos processando seu pagamento. Isso pode levar alguns instantes."}
          </p>
        </div>

        {/* Card do personal */}
        {aula && (
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              {aula.personal.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={aula.personal.avatarUrl} alt={aula.personal.nome} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-yellow-500">{initials}</span>
              )}
            </div>
            <div>
              <p className="font-bold">{aula.personal.nome} {aula.personal.sobrenome}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                R$ {aula.valor.toFixed(2).replace(".", ",")} &bull; 1 aula avulsa
              </p>
            </div>
          </div>
        )}

        {/* Mensagem de status */}
        <div className={`w-full rounded-2xl p-5 border ${status === "paga" ? "bg-green-500/5 border-green-500/20" : "bg-yellow-500/5 border-yellow-500/20"}`}>
          {status === "paga" ? (
            <div className="space-y-2 text-sm text-zinc-300 leading-relaxed">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">{aula?.personal.nome}</strong> foi notificado(a) e entrará em contato em breve.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>O pagamento fica retido até você confirmar que a aula aconteceu.</span>
              </p>
              {whatsappUrl && (
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Se preferir, você já pode enviar uma mensagem agora — o contato foi liberado!</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 leading-relaxed">
              Assim que o pagamento for processado, <strong className="text-white">{aula?.personal.nome}</strong> será notificado(a) e entrará em contato. Você também pode enviar uma mensagem se preferir.
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="w-full flex flex-col gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-base rounded-2xl transition"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar mensagem para {aula?.personal.nome}
            </a>
          )}
          <button
            onClick={() => router.push("/dashboard/aluno/aulas")}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm rounded-2xl transition"
          >
            <Home className="w-4 h-4" />
            Ver minhas aulas
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
