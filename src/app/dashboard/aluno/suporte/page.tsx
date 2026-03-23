"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Loader2,
  Check,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

const inputCls =
  "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition";
const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";

const FAQ = [
  {
    q: "Como encontro um personal trainer?",
    a: "Em breve a funcionalidade de busca estará disponível. Você poderá filtrar por academia ou região.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Todo pagamento é feito pela plataforma. Após a confirmação, os dados de contato são liberados para ambas as partes.",
  },
  {
    q: "Posso cancelar uma aula?",
    a: "Sim, desde que seja feito com antecedência. As políticas de cancelamento serão detalhadas em breve.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Nenhuma informação pessoal é compartilhada antes do pagamento ser confirmado.",
  },
];

export default function SuportePage() {
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!assunto || !mensagem) return;
    setSending(true);
    // TODO: enviar para API
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <Link
        href="/dashboard/aluno"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-3xl font-black uppercase italic tracking-tight mb-2">
        <span className="text-yellow-500">Suporte</span>
      </h1>
      <p className="text-zinc-400 mb-10">
        Tem alguma dúvida ou precisa de ajuda? Estamos aqui.
      </p>

      {/* ── FAQ ── */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-yellow-500" />
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="border border-zinc-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-900/50 transition"
              >
                <span className="text-sm font-medium text-zinc-200">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Formulário de contato ── */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-yellow-500" />
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
            Enviar Mensagem
          </h2>
        </div>

        {sent ? (
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-lg font-bold mb-2">Mensagem enviada!</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Vamos responder o mais rápido possível.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setAssunto("");
                setMensagem("");
              }}
              className="text-yellow-500 text-sm font-semibold hover:text-yellow-400 transition"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className={labelCls}>Assunto</label>
              <select
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">Selecione</option>
                <option value="duvida">Dúvida geral</option>
                <option value="problema">Problema técnico</option>
                <option value="pagamento">Pagamento</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Mensagem</label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={5}
                className={`${inputCls} resize-none`}
                placeholder="Descreva como podemos ajudar..."
              />
            </div>

            <button
              type="submit"
              disabled={sending || !assunto || !mensagem}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Enviar
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
