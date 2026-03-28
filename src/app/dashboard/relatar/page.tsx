"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  UserX,
  ShieldAlert,
  Ban,
  Clock,
  DollarSign,
  ThumbsDown,
  HeartCrack,
  HelpCircle,
} from "lucide-react";

const CATEGORIAS = [
  { id: "nao_compareceu", label: "Não compareceu", desc: "O profissional/aluno não apareceu na aula", icon: UserX, color: "text-red-400 bg-red-500/10 border-red-500/30" },
  { id: "assedio", label: "Assédio", desc: "Comportamento de assédio sexual, moral ou verbal", icon: ShieldAlert, color: "text-red-400 bg-red-500/10 border-red-500/30" },
  { id: "comportamento_inadequado", label: "Comportamento inadequado", desc: "Falta de respeito, grosseria ou atitude antiprofissional", icon: Ban, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  { id: "atraso_excessivo", label: "Atraso excessivo", desc: "Atraso significativo sem aviso prévio", icon: Clock, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  { id: "cobranca_indevida", label: "Cobrança indevida", desc: "Cobrança fora da plataforma ou valor divergente", icon: DollarSign, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  { id: "qualidade_servico", label: "Qualidade do serviço", desc: "Aula abaixo do esperado ou falta de preparo", icon: ThumbsDown, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  { id: "discriminacao", label: "Discriminação", desc: "Tratamento discriminatório por raça, gênero, orientação ou deficiência", icon: HeartCrack, color: "text-red-400 bg-red-500/10 border-red-500/30" },
  { id: "outro", label: "Outro problema", desc: "Descreva o problema abaixo com detalhes", icon: HelpCircle, color: "text-zinc-400 bg-zinc-800 border-zinc-700" },
];

interface AulaInfo {
  id: string;
  status: string;
  createdAt: string;
  personal?: { id: string; nome: string; sobrenome: string };
  aluno?: { id: string; nome: string; sobrenome: string };
}

export default function RelatarProblemaPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-yellow-500 animate-spin" /></div>}>
      <RelatarContent />
    </Suspense>
  );
}

function RelatarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const aulaId = searchParams.get("aulaId");
  const relatadoIdParam = searchParams.get("relatadoId");
  const nomeParam = searchParams.get("nome");
  const volta = searchParams.get("volta") || "/dashboard/aluno/aulas";

  const [aula, setAula] = useState<AulaInfo | null>(null);
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aulaId) {
      fetch(`/api/aulas/${aulaId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then(setAula)
        .catch(() => {});
    }
  }, [aulaId]);

  const nomeRelatado = nomeParam || (aula?.personal?.nome ? `${aula.personal.nome} ${aula.personal.sobrenome}` : aula?.aluno?.nome ? `${aula.aluno.nome} ${aula.aluno.sobrenome}` : "");
  const relatadoId = relatadoIdParam || aula?.personal?.id || aula?.aluno?.id || "";

  async function handleSubmit() {
    if (!categoria || !descricao.trim() || !relatadoId) {
      setErro("Selecione uma categoria e descreva o problema.");
      return;
    }
    if (descricao.trim().length < 10) {
      setErro("A descrição deve ter no mínimo 10 caracteres.");
      return;
    }
    setEnviando(true);
    setErro("");

    const res = await fetch("/api/relatos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aulaId: aulaId || undefined,
        relatadoId,
        categoria,
        descricao: descricao.trim(),
      }),
    });

    if (res.ok) {
      setEnviado(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao enviar relato. Tente novamente.");
    }
    setEnviando(false);
  }

  if (enviado) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Relato enviado</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Recebemos seu relato e nossa equipe irá analisar o caso. Você será notificado sobre a resolução.
        </p>
        <button
          onClick={() => router.push(volta)}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition"
        >
          Voltar às aulas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        <h1 className="text-2xl font-black">Relatar um Problema</h1>
      </div>
      <p className="text-zinc-500 text-sm mb-8">
        Descreva o ocorrido com detalhes. Todos os relatos são analisados pela equipe Personal Agora e tratados com sigilo.
      </p>

      {/* Relacionado a */}
      {nomeRelatado && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xs text-zinc-500">Relato sobre:</span>
          <span className="text-sm font-semibold text-white">{nomeRelatado}</span>
          {aulaId && (
            <span className="text-xs text-zinc-600 ml-auto">
              Aula de {aula ? new Date(aula.createdAt).toLocaleDateString("pt-BR") : "..."}
            </span>
          )}
        </div>
      )}

      {/* Categorias */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-zinc-300 mb-3">Qual o tipo do problema?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORIAS.map((cat) => {
            const Icon = cat.icon;
            const selected = categoria === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoria(cat.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition ${
                  selected
                    ? "border-yellow-500 bg-yellow-500/10"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${cat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${selected ? "text-yellow-400" : "text-white"}`}>
                    {cat.label}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Descrição */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-zinc-300 block mb-2">Descreva o ocorrido</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Conte com detalhes o que aconteceu. Quanto mais informações, melhor poderemos ajudar..."
          rows={5}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50 resize-none transition"
        />
        <p className="text-xs text-zinc-600 mt-1">{descricao.length} caractere{descricao.length !== 1 ? "s" : ""} (mínimo 10)</p>
      </div>

      {/* Erro */}
      {erro && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {erro}
        </div>
      )}

      {/* Info box */}
      <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <p className="text-xs text-zinc-400 leading-relaxed">
          <strong className="text-zinc-300">Como funciona:</strong> Seu relato será analisado pela nossa equipe em até 48 horas úteis.
          Dependendo da gravidade, o usuário relatado poderá receber uma advertência, suspensão temporária ou banimento permanente da plataforma.
          Em casos de assédio ou discriminação, incentivamos também o registro de um boletim de ocorrência.
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={enviando || !categoria || descricao.trim().length < 10 || !relatadoId}
        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-base rounded-xl transition flex items-center justify-center gap-2"
      >
        {enviando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5" />
            Enviar relato
          </>
        )}
      </button>
    </div>
  );
}
