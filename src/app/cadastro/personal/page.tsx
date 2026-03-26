"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  X,
  Search,
  Upload,
  Camera,
  FileText,
  Gift,
  Ticket,
  MapPin,
  Rocket,
  Star,
  Crown,
} from "lucide-react";
import PasswordField from "@/components/PasswordField";
import {
  maskPhone,
  maskCEP,
  maskCPF,
  maskDate,
  maskMonthYear,
  unmask,
  fetchAddressByCep,
} from "@/lib/masks";

/* ── Modalidades disponíveis ── */
const MODALIDADES = [
  "Musculação",
  "Funcional",
  "Pilates",
  "Crossfit",
  "Yoga",
  "Natação",
  "Corrida",
  "Luta / Artes Marciais",
  "Dança",
  "Alongamento",
  "Reabilitação",
  "Emagrecimento",
  "Hipertrofia",
  "Preparação Física",
];

/* ── Dias da semana ── */
const DIAS_SEMANA = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
] as const;

const HORARIOS = [
  "05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00",
];

type Disponibilidade = Record<string, string[]>;

/* ── Schema ── */
const schema = z
  .object({
    /* 1 — Conta */
    nome: z.string().min(2, "Mínimo 2 caracteres"),
    sobrenome: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(6, "Mínimo 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
    telefone: z.string().min(14, "Telefone inválido"),
    isWhatsapp: z.boolean(),
    isTelefone: z.boolean(),
    /* 2 — Pessoal */
    dataNascimento: z.string().min(10, "Data inválida"),
    sexo: z.string().min(1, "Selecione"),
    cpf: z.string().min(14, "CPF inválido"),
    cep: z.string().min(9, "CEP inválido"),
    rua: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    numero: z.string().min(1, "Obrigatório"),
    complemento: z.string().optional(),
    /* 3 — Documentos */
    cref: z.string().min(4, "CREF obrigatório"),
    validadeCref: z.string().min(7, "Validade obrigatória"),
    formacao: z.string().min(1, "Selecione"),
    rg: z.string().min(5, "RG obrigatório"),
    /* 4 — Trabalho */
    academias: z.array(z.string()).min(1, "Selecione ao menos uma academia"),
    modalidades: z.array(z.string()).min(1, "Selecione ao menos uma modalidade"),
    regioes: z.array(z.string()).min(1, "Selecione ao menos uma região"),
    preferenciaGeneroAluno: z.string().min(1, "Selecione uma opção"),
    disponivelEmCasa: z.boolean(),
    valorAproximado: z.string().min(1, "Informe um valor"),
    disponibilidade: z.string().min(2, "Selecione ao menos um horário"),
    /* 5 — Plano & Financeiro */
    plano: z.string().min(1, "Selecione um plano"),
    tipoChavePix: z.string().min(1, "Selecione"),
    chavePix: z.string().min(3, "Informe a chave"),
    confirmaPixProprio: z.literal(true, {
      errorMap: () => ({ message: "Confirme que o PIX é seu" }),
    }),
    aceitaTaxa: z.literal(true, {
      errorMap: () => ({ message: "Aceite os termos" }),
    }),
    /* Convite/Cupom */
    codigoConvite: z.string().optional(),
    codigoCupom: z.string().optional(),
  })
  .refine((d) => d.isWhatsapp || d.isTelefone, {
    message: "Marque pelo menos uma opção",
    path: ["isWhatsapp"],
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type FormData = z.infer<typeof schema>;

const STEP_FIELDS: (keyof FormData)[][] = [
  ["nome", "sobrenome", "email", "senha", "confirmarSenha", "telefone"],
  ["dataNascimento", "sexo", "cpf", "cep", "numero"],
  ["cref", "validadeCref", "formacao", "rg"],
  ["modalidades", "regioes", "preferenciaGeneroAluno", "valorAproximado", "disponibilidade"],
  ["plano", "tipoChavePix", "chavePix", "confirmaPixProprio", "aceitaTaxa"],
];

const STEP_LABELS = ["Conta", "Pessoal", "Documentos", "Trabalho", "Plano & Financeiro"];

/* ── Estilos ── */
const inputCls =
  "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition";
const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";
const errorCls = "text-red-400 text-xs mt-1";

export default function CadastroPersonalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    }>
      <CadastroPersonalContent />
    </Suspense>
  );
}

function CadastroPersonalContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [apiError, setApiError] = useState("");

  /* uploads locais (preview) */
  const [fotoCref, setFotoCref] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const fotoCrefRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  /* academia search — carregadas do banco */
  const [academiasDB, setAcademiasDB] = useState<{ id: string; nome: string; endereco: string }[]>([]);
  const [acSearch, setAcSearch] = useState("");
  const [acOpen, setAcOpen] = useState(false);
  const acRef = useRef<HTMLDivElement>(null);

  /* região search */
  const [regSearch, setRegSearch] = useState("");
  const [regOpen, setRegOpen] = useState(false);
  const regRef = useRef<HTMLDivElement>(null);

  /* disponibilidade */
  const [disp, setDisp] = useState<Disponibilidade>({
    seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [],
  });

  /* convite / cupom */
  const [showConvite, setShowConvite] = useState(false);
  const [showCupom, setShowCupom] = useState(searchParams.get("cupom") === "1");
  const [conviteStatus, setConviteStatus] = useState<{ valido?: boolean; erro?: string; msg?: string }>({});
  const [cupomInput, setCupomInput] = useState("");
  const [cupomStatus, setCupomStatus] = useState<{ valido?: boolean; erro?: string; descricao?: string }>({});

  /* convite pre-screen */
  const [preScreen, setPreScreen] = useState(searchParams.get("convite") === "1");
  const [convitePreCpf, setConvitePreCpf] = useState("");
  const [convitePreStatus, setConvitePreStatus] = useState<{ valido?: boolean; erro?: string }>({});
  const [conviteValidated, setConviteValidated] = useState(false);
  const [convitePreLoading, setConvitePreLoading] = useState(false);

  /* região search — Google Places */
  const [regSuggestions, setRegSuggestions] = useState<{ description: string }[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const regDebounceRef = useRef<NodeJS.Timeout | null>(null);

  /* CPF já existente como aluno */
  const [cpfWarning, setCpfWarning] = useState<"aluno" | "personal" | null>(null);
  const [cpfChecking, setCpfChecking] = useState(false);
  const [cpfConfirmed, setCpfConfirmed] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isWhatsapp: true,
      isTelefone: false,
      academias: [],
      modalidades: [],
      regioes: [],
      preferenciaGeneroAluno: "",
      disponivelEmCasa: false,
      rua: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: "",
      codigoConvite: "",
      codigoCupom: "",
      plano: "",
      disponibilidade: "",
      confirmaPixProprio: false as unknown as true,
      aceitaTaxa: false as unknown as true,
    },
  });

  const w = watch();

  /* carregar academias do banco (endpoint público) */
  useEffect(() => {
    fetch("/api/academias")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAcademiasDB(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  /* fechar dropdowns */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (acRef.current && !acRef.current.contains(e.target as Node)) setAcOpen(false);
      if (regRef.current && !regRef.current.contains(e.target as Node)) setRegOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Nav ── */
  async function nextStep() {
    setPhoneError("");
    const valid = await trigger(STEP_FIELDS[step]);
    if (step === 0 && !w.isWhatsapp && !w.isTelefone) {
      setPhoneError("Marque pelo menos uma opção (WhatsApp ou Telefone)");
      return;
    }
    if (step === 1 && cpfWarning === "personal") return;
    if (step === 1 && cpfWarning === "aluno" && !cpfConfirmed) return;
    if (valid) setStep((s) => s + 1);
  }

  /* ── Submit ── */
  async function onSubmit(data: FormData) {
    setApiError("");
    try {
      const res = await fetch("/api/cadastro/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          plano: data.plano,
          modalidades: data.modalidades,
          regioes: data.regioes,
          codigoConvite: conviteValidated ? "cpf" : (conviteStatus.valido ? "cpf" : undefined),
          codigoCupom: cupomStatus.valido ? cupomInput : undefined,
          confirmarCpfDuplicado: cpfConfirmed,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setApiError(err.message || err.error || "Erro ao enviar cadastro");
        return;
      }

      // Upload de arquivos se houver
      const { id } = await res.json();
      if (fotoCref || selfie) {
        const formData = new FormData();
        if (fotoCref) formData.append("fotoCref", fotoCref);
        if (selfie) formData.append("selfie", selfie);
        await fetch(`/api/cadastro/personal/${id}/upload`, {
          method: "POST",
          body: formData,
        }).catch(() => {}); // upload é best-effort
      }

      setDone(true);
    } catch {
      setApiError("Erro de conexão. Tente novamente.");
    }
  }

  /* ── CEP ── */
  async function handleCepBlur() {
    const cep = w.cep;
    if (!cep || unmask(cep).length !== 8) return;
    setLoadingCep(true);
    const addr = await fetchAddressByCep(cep);
    if (addr) {
      setValue("rua", addr.rua);
      setValue("bairro", addr.bairro);
      setValue("cidade", addr.cidade);
      setValue("estado", addr.estado);
    }
    setLoadingCep(false);
  }

  /* ── CPF check antecipado ── */
  async function checkCpf(value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length !== 11) return;
    setCpfChecking(true);
    setCpfWarning(null);
    try {
      const res = await fetch(`/api/check-cpf?cpf=${clean}`);
      const data = await res.json();
      if (data.exists) {
        setCpfWarning(
          data.tipo === "personal" || data.tipo === "ambos" ? "personal" : "aluno"
        );
      }
    } finally {
      setCpfChecking(false);
    }
  }

  /* ── Academia toggles ── */
  function addAcademia(a: string) {
    const cur = w.academias || [];
    if (!cur.includes(a)) setValue("academias", [...cur, a], { shouldValidate: true });
    setAcSearch("");
    setAcOpen(false);
  }
  function removeAcademia(a: string) {
    setValue("academias", (w.academias || []).filter((x) => x !== a));
  }
  const filteredAc = academiasDB
    .filter(
      (a) =>
        acSearch.length >= 2 &&
        a.nome.toLowerCase().includes(acSearch.toLowerCase()) &&
        !(w.academias || []).includes(a.nome)
    );

  /* ── Região toggles ── */
  function addRegiao(r: string) {
    const cur = w.regioes || [];
    if (!cur.includes(r)) setValue("regioes", [...cur, r], { shouldValidate: true });
    setRegSearch("");
    setRegOpen(false);
    setRegSuggestions([]);
  }
  function removeRegiao(r: string) {
    setValue("regioes", (w.regioes || []).filter((x) => x !== r), { shouldValidate: true });
  }
  function handleRegSearchChange(value: string) {
    setRegSearch(value);
    setRegOpen(true);
    if (regDebounceRef.current) clearTimeout(regDebounceRef.current);
    if (value.length < 2) {
      setRegSuggestions([]);
      return;
    }
    regDebounceRef.current = setTimeout(async () => {
      setRegLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(value)}`);
        const data = await res.json();
        setRegSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setRegSuggestions([]);
      }
      setRegLoading(false);
    }, 300);
  }

  /* ── Modalidade toggle ── */
  function toggleModalidade(m: string) {
    const cur = w.modalidades || [];
    if (cur.includes(m)) {
      setValue("modalidades", cur.filter((x) => x !== m), { shouldValidate: true });
    } else {
      setValue("modalidades", [...cur, m], { shouldValidate: true });
    }
  }

  /* ── Disponibilidade toggle ── */
  function toggleHorario(dia: string, horario: string) {
    setDisp((prev) => {
      const cur = prev[dia] || [];
      const next = cur.includes(horario) ? cur.filter((h) => h !== horario) : [...cur, horario].sort();
      const updated = { ...prev, [dia]: next };
      // Serializar para o campo do form
      const hasAny = Object.values(updated).some((arr) => arr.length > 0);
      setValue("disponibilidade", hasAny ? JSON.stringify(updated) : "", { shouldValidate: true });
      return updated;
    });
  }

  function toggleDiaInteiro(dia: string) {
    setDisp((prev) => {
      const cur = prev[dia] || [];
      const next = cur.length === HORARIOS.length ? [] : [...HORARIOS];
      const updated = { ...prev, [dia]: next };
      const hasAny = Object.values(updated).some((arr) => arr.length > 0);
      setValue("disponibilidade", hasAny ? JSON.stringify(updated) : "", { shouldValidate: true });
      return updated;
    });
  }

  /* ── Validar convite ── */
  async function validarConvite() {
    if (!w.cpf || unmask(w.cpf).length !== 11) {
      setConviteStatus({ erro: "Preencha o CPF no passo 2 antes de validar" });
      return;
    }
    try {
      const res = await fetch("/api/convite/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: w.cpf }),
      });
      const data = await res.json();
      if (res.ok) {
        setConviteStatus({ valido: true, msg: data.beneficio });
        setValue("codigoConvite", "cpf");
        setValue("plano", "pro");
      } else {
        setConviteStatus({ erro: data.error });
      }
    } catch {
      setConviteStatus({ erro: "Erro ao validar convite" });
    }
  }

  /* ── Validar convite (pré-tela) ── */
  async function validarConvitePre() {
    if (!convitePreCpf || unmask(convitePreCpf).length !== 11) {
      setConvitePreStatus({ erro: "CPF inválido" });
      return;
    }
    setConvitePreLoading(true);
    try {
      const res = await fetch("/api/convite/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: convitePreCpf }),
      });
      const data = await res.json();
      if (res.ok) {
        setConvitePreStatus({ valido: true });
      } else {
        setConvitePreStatus({ erro: data.error });
      }
    } catch {
      setConvitePreStatus({ erro: "Erro ao validar convite" });
    }
    setConvitePreLoading(false);
  }

  /* ── Validar cupom ── */
  async function validarCupom() {
    if (!cupomInput.trim()) return;
    try {
      const res = await fetch("/api/cupom/aplicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: cupomInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setCupomStatus({ valido: true, descricao: data.descricao });
        setValue("codigoCupom", cupomInput);
      } else {
        setCupomStatus({ erro: data.error });
      }
    } catch {
      setCupomStatus({ erro: "Erro ao validar cupom" });
    }
  }

  /* ── Preview de arquivo ── */
  function filePreview(file: File | null) {
    if (!file) return null;
    if (file.type.startsWith("image/")) return URL.createObjectURL(file);
    return null;
  }

  /* ── Pré-tela: Convite ── */
  if (preScreen && !conviteValidated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 selection:bg-yellow-500 selection:text-black">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Gift className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black uppercase italic tracking-tight mb-2">
              Validar <span className="text-yellow-500">Convite</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              Digite seu CPF para verificar se você tem um convite e ganhar{" "}
              <strong className="text-white">2 meses grátis no Plano Pro</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>CPF</label>
              <input
                value={convitePreCpf}
                onChange={(e) => {
                  setConvitePreCpf(maskCPF(e.target.value));
                  setConvitePreStatus({});
                }}
                className={inputCls}
                placeholder="000.000.000-00"
              />
            </div>

            {convitePreStatus.valido && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" /> Convite encontrado!
                </p>
                <p className="text-zinc-300 text-xs mt-2 leading-relaxed">
                  Parabéns! Você ganhou 2 meses de mensalidade grátis. Durante esses 2 meses
                  você irá usufruir dos benefícios do Plano Pro. Após o teste, você escolhe qual
                  vai ser.
                </p>
              </div>
            )}
            {convitePreStatus.erro && (
              <p className="text-red-400 text-sm">{convitePreStatus.erro}</p>
            )}

            <div className="flex gap-3 pt-2">
              {!convitePreStatus.valido ? (
                <>
                  <button
                    type="button"
                    onClick={validarConvitePre}
                    disabled={convitePreLoading}
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {convitePreLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Verificar CPF"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreScreen(false)}
                    className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-full font-semibold hover:border-zinc-500 transition"
                  >
                    Não tenho convite
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConviteValidated(true);
                    setPreScreen(false);
                    setValue("cpf", convitePreCpf);
                    setValue("plano", "pro");
                    setValue("codigoConvite", "cpf");
                    setConviteStatus({ valido: true, msg: "2 meses grátis no plano Pro" });
                  }}
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition flex items-center justify-center gap-2"
                >
                  Continuar cadastro
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-center pt-2">
              <Link href="/personal" className="text-zinc-500 hover:text-zinc-400 text-xs transition">
                ← Voltar para a página
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── Sucesso ── */
  if (done) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 selection:bg-yellow-500 selection:text-black">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight mb-4">Cadastro enviado!</h1>
          <p className="text-zinc-400 mb-8">
            Nosso time vai analisar seus dados e aprovar seu perfil. Você receberá um e-mail assim que estiver
            liberado para receber alunos.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition hover:scale-105 active:scale-95"
          >
            Voltar para Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  /* ── Formulário ── */
  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 md:px-6 selection:bg-yellow-500 selection:text-black">
      <div className="max-w-xl mx-auto">
        <Link
          href="/cadastro"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="text-3xl font-black uppercase italic tracking-tight mb-1">
          Cadastro de <span className="text-yellow-500">Personal</span>
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Passo {step + 1} de {STEP_LABELS.length}
        </p>

        {/* ── Stepper ── */}
        <div className="flex items-center gap-1.5 mb-10">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  i <= step ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded ${i < step ? "bg-yellow-500" : "bg-zinc-800"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* ╔══════════ STEP 1 — Conta ══════════╗ */}
          {step === 0 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nome</label>
                  <input {...register("nome")} className={inputCls} placeholder="Gabriel" />
                  {errors.nome && <p className={errorCls}>{errors.nome.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Sobrenome</label>
                  <input {...register("sobrenome")} className={inputCls} placeholder="Silva" />
                  {errors.sobrenome && <p className={errorCls}>{errors.sobrenome.message}</p>}
                </div>
              </div>

              <div>
                <label className={labelCls}>E-mail</label>
                <input {...register("email")} type="email" className={inputCls} placeholder="seu@email.com" />
                {errors.email && <p className={errorCls}>{errors.email.message}</p>}
              </div>

              <PasswordField
                value={w.senha || ""}
                confirmValue={w.confirmarSenha || ""}
                onChange={(v) => setValue("senha", v, { shouldValidate: !!errors.senha })}
                onConfirmChange={(v) => setValue("confirmarSenha", v, { shouldValidate: !!errors.confirmarSenha })}
                error={errors.senha?.message}
                confirmError={errors.confirmarSenha?.message}
              />

              <div>
                <label className={labelCls}>Telefone</label>
                <input
                  {...register("telefone")}
                  className={inputCls}
                  placeholder="(11) 91234-5678"
                  onChange={(e) => setValue("telefone", maskPhone(e.target.value))}
                />
                {errors.telefone && <p className={errorCls}>{errors.telefone.message}</p>}
                <div className="flex gap-6 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isWhatsapp")}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                    />
                    <span className="text-sm text-zinc-300">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isTelefone")}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                    />
                    <span className="text-sm text-zinc-300">Telefone</span>
                  </label>
                </div>
                {phoneError && <p className={errorCls}>{phoneError}</p>}
              </div>
            </div>
          )}

          {/* ╔══════════ STEP 2 — Pessoal & Endereço ══════════╗ */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Data de Nascimento</label>
                  <input
                    {...register("dataNascimento")}
                    className={inputCls}
                    placeholder="DD/MM/AAAA"
                    onChange={(e) => setValue("dataNascimento", maskDate(e.target.value))}
                  />
                  {errors.dataNascimento && <p className={errorCls}>{errors.dataNascimento.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Sexo</label>
                  <select {...register("sexo")} className={`${inputCls} appearance-none`} defaultValue="">
                    <option value="" disabled>Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Prefiro não dizer</option>
                  </select>
                  {errors.sexo && <p className={errorCls}>{errors.sexo.message}</p>}
                </div>
              </div>

              <div>
                <label className={labelCls}>CPF</label>
                <input
                  {...register("cpf")}
                  className={inputCls}
                  placeholder="000.000.000-00"
                  onChange={(e) => {
                    setValue("cpf", maskCPF(e.target.value));
                    setCpfWarning(null);
                    setCpfConfirmed(false);
                  }}
                  onBlur={(e) => checkCpf(e.target.value)}
                />
                {errors.cpf && <p className={errorCls}>{errors.cpf.message}</p>}
                {cpfChecking && (
                  <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin inline" /> Verificando CPF...
                  </p>
                )}
                {cpfWarning === "personal" && (
                  <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-medium">CPF já cadastrado como personal</p>
                    <p className="text-red-300/80 text-xs mt-1">
                      Este CPF já possui um cadastro de personal trainer.{" "}
                      <Link href="/login" className="underline">Faça login</Link>.
                    </p>
                  </div>
                )}
                {cpfWarning === "aluno" && !cpfConfirmed && (
                  <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm font-medium">CPF já cadastrado como aluno</p>
                    <p className="text-yellow-300/80 text-xs mt-1">
                      Seu perfil de aluno será mantido. Você poderá acessar os dois perfis com o mesmo login.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCpfConfirmed(true)}
                      className="mt-2 text-xs bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition"
                    >
                      Entendido, continuar
                    </button>
                  </div>
                )}
                {cpfWarning === "aluno" && cpfConfirmed && (
                  <p className="text-green-400 text-xs mt-1">
                    ✓ Cadastro de personal será vinculado ao seu perfil existente.
                  </p>
                )}
              </div>

              <hr className="border-zinc-800" />

              <div>
                <label className={labelCls}>CEP</label>
                <div className="relative">
                  <input
                    {...register("cep")}
                    className={`${inputCls} pr-10`}
                    placeholder="00000-000"
                    onChange={(e) => setValue("cep", maskCEP(e.target.value))}
                    onBlur={handleCepBlur}
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500 animate-spin" />
                  )}
                </div>
                {errors.cep && <p className={errorCls}>{errors.cep.message}</p>}
              </div>

              {w.rua && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Rua</label>
                      <input {...register("rua")} className={`${inputCls} bg-zinc-900`} readOnly />
                    </div>
                    <div>
                      <label className={labelCls}>Bairro</label>
                      <input {...register("bairro")} className={`${inputCls} bg-zinc-900`} readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Cidade</label>
                      <input {...register("cidade")} className={`${inputCls} bg-zinc-900`} readOnly />
                    </div>
                    <div>
                      <label className={labelCls}>Estado</label>
                      <input {...register("estado")} className={`${inputCls} bg-zinc-900`} readOnly />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Número</label>
                  <input {...register("numero")} className={inputCls} placeholder="123" />
                  {errors.numero && <p className={errorCls}>{errors.numero.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Complemento</label>
                  <input {...register("complemento")} className={inputCls} placeholder="Apto, bloco..." />
                </div>
              </div>
            </div>
          )}

          {/* ╔══════════ STEP 3 — Documentos ══════════╗ */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>CREF</label>
                  <input {...register("cref")} className={inputCls} placeholder="000000-G/SP" />
                  {errors.cref && <p className={errorCls}>{errors.cref.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Validade do CREF</label>
                  <input
                    {...register("validadeCref")}
                    className={inputCls}
                    placeholder="MM/AAAA"
                    onChange={(e) => setValue("validadeCref", maskMonthYear(e.target.value))}
                  />
                  {errors.validadeCref && <p className={errorCls}>{errors.validadeCref.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Formação</label>
                  <select {...register("formacao")} className={`${inputCls} appearance-none`} defaultValue="">
                    <option value="" disabled>Selecione</option>
                    <option value="licenciatura">Licenciatura</option>
                    <option value="bacharelado">Bacharelado</option>
                  </select>
                  {errors.formacao && <p className={errorCls}>{errors.formacao.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>RG</label>
                  <input {...register("rg")} className={inputCls} placeholder="00.000.000-0" />
                  {errors.rg && <p className={errorCls}>{errors.rg.message}</p>}
                </div>
              </div>

              {/* Foto do CREF */}
              <div>
                <label className={labelCls}>Foto do CREF</label>
                <input
                  ref={fotoCrefRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFotoCref(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fotoCrefRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition ${
                    fotoCref
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {fotoCref ? (
                    <div className="flex items-center gap-3 justify-center">
                      {filePreview(fotoCref) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={filePreview(fotoCref)!}
                          alt="CREF"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-yellow-500" />
                      )}
                      <div className="text-left">
                        <p className="text-sm text-white font-medium">{fotoCref.name}</p>
                        <p className="text-xs text-zinc-500">Clique para trocar</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Clique para enviar a foto do seu CREF</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Selfie */}
              <div>
                <label className={labelCls}>Selfie</label>
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelfie(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => selfieRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition ${
                    selfie
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {selfie ? (
                    <div className="flex items-center gap-3 justify-center">
                      {filePreview(selfie) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={filePreview(selfie)!}
                          alt="Selfie"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-yellow-500" />
                      )}
                      <div className="text-left">
                        <p className="text-sm text-white font-medium">{selfie.name}</p>
                        <p className="text-xs text-zinc-500">Clique para trocar</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <Camera className="w-8 h-8" />
                      <span className="text-sm">Clique para tirar / enviar sua selfie</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ╔══════════ STEP 4 — Trabalho ══════════╗ */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Modalidades */}
              <div>
                <label className={labelCls}>Modalidades que você atende</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {MODALIDADES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleModalidade(m)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition text-left ${
                        (w.modalidades || []).includes(m)
                          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {errors.modalidades && <p className={errorCls}>{errors.modalidades.message}</p>}
              </div>

              {/* Regiões */}
              <div ref={regRef}>
                <label className={labelCls}>Regiões onde você atende</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => handleRegSearchChange(e.target.value)}
                    onFocus={() => setRegOpen(true)}
                    className={`${inputCls} pl-10`}
                    placeholder="Digite bairro, cidade ou estado (ex: Alphaville, Moema)..."
                  />
                  {regLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500 animate-spin" />
                  )}
                  {regOpen && regSearch.length >= 2 && !regLoading && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                      {regSuggestions
                        .filter((s) => !(w.regioes || []).includes(s.description))
                        .map((s) => (
                          <button
                            key={s.description}
                            type="button"
                            onClick={() => addRegiao(s.description)}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 transition flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                            {s.description}
                          </button>
                        ))}
                      {regSuggestions.filter((s) => !(w.regioes || []).includes(s.description)).length === 0 && (
                        <p className="px-4 py-3 text-sm text-zinc-500 text-center">
                          Nenhum local encontrado. Tente outro nome ou CEP.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {(w.regioes || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(w.regioes || []).map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20"
                      >
                        {r}
                        <button type="button" onClick={() => removeRegiao(r)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.regioes && <p className={errorCls}>{errors.regioes.message}</p>}
              </div>

              {/* Academias */}
              <div ref={acRef}>
                <label className={labelCls}>Academias onde você dá aula <span className="text-red-500">*</span> <span className="text-zinc-500 font-normal text-xs">(pode selecionar mais de uma)</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={acSearch}
                    onChange={(e) => {
                      setAcSearch(e.target.value);
                      setAcOpen(true);
                    }}
                    onFocus={() => setAcOpen(true)}
                    className={`${inputCls} pl-10`}
                    placeholder="Buscar academia..."
                  />
                  {acOpen && (filteredAc.length > 0 || acSearch.length >= 2) && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                      {filteredAc.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => addAcademia(a.nome)}
                          className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 transition"
                        >
                          <span className="font-medium">{a.nome}</span>
                          {a.endereco && <span className="block text-xs text-zinc-500 mt-0.5">{a.endereco}</span>}
                        </button>
                      ))}
                      {acSearch.length >= 2 && !filteredAc.find(a => a.nome === acSearch) && !(w.academias || []).includes(acSearch) && (
                        <button
                          type="button"
                          onClick={() => addAcademia(acSearch)}
                          className="w-full text-left px-4 py-2.5 text-sm text-yellow-500 hover:bg-zinc-700 transition border-t border-zinc-700"
                        >
                          + Adicionar &quot;{acSearch}&quot;
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {(w.academias || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(w.academias || []).map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20"
                      >
                        {a}
                        <button type="button" onClick={() => removeAcademia(a)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.academias && <p className={errorCls}>{errors.academias.message}</p>}
              </div>

              {/* Preferência de gênero */}
              <div>
                <label className={labelCls}>Preferência de gênero para aulas</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { value: "ambos", label: "Ambos" },
                    { value: "homens", label: "Só Homens" },
                    { value: "mulheres", label: "Só Mulheres" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue("preferenciaGeneroAluno", value, { shouldValidate: true })}
                      className={`px-4 py-3 rounded-lg text-sm font-medium border transition ${
                        w.preferenciaGeneroAluno === value
                          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.preferenciaGeneroAluno && <p className={errorCls}>{errors.preferenciaGeneroAluno.message}</p>}
              </div>

              {/* Disponibilidade em casa */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("disponivelEmCasa")}
                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                  />
                  <div>
                    <span className="text-sm text-white font-medium">
                      Tenho disponibilidade para aulas particulares em casa / domicílio
                    </span>
                  </div>
                </label>
              </div>

              {/* Valor aproximado */}
              <div>
                <label className={labelCls}>Valor aproximado por hora (aula avulsa)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">
                    R$
                  </span>
                  <input
                    {...register("valorAproximado")}
                    type="number"
                    min="0"
                    className={`${inputCls} pl-12`}
                    placeholder="150"
                  />
                </div>
                {errors.valorAproximado && <p className={errorCls}>{errors.valorAproximado.message}</p>}
                <p className="text-zinc-600 text-xs mt-2">
                  Esse é o valor que <strong className="text-zinc-400">aparecerá para o aluno</strong> como preço da hora/aula.
                  Você pode alterar esse valor a qualquer momento no seu painel após o cadastro.
                </p>
              </div>

              {/* Disponibilidade de horários */}
              <div>
                <label className={labelCls}>Dias e horários disponíveis</label>
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-4">
                  <p className="text-amber-400 text-xs leading-relaxed">
                    <strong>Importante:</strong> mantenha seus dias e horários sempre atualizados.
                    Quando um aluno buscar um dia/horário específico, só aparecerão os personais com disponibilidade naquele momento.
                    Se não estiver atualizado, você não aparecerá na busca.
                  </p>
                  <p className="text-zinc-500 text-xs mt-2">
                    Você poderá alterar sua disponibilidade quantas vezes quiser depois do cadastro, no seu painel.
                  </p>
                </div>
                <div className="space-y-3">
                  {DIAS_SEMANA.map(({ key, label }) => {
                    const selected = disp[key] || [];
                    const allSelected = selected.length === HORARIOS.length;
                    return (
                      <div key={key} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{label}</span>
                          <button
                            type="button"
                            onClick={() => toggleDiaInteiro(key)}
                            className={`text-xs px-2 py-1 rounded transition ${
                              allSelected
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {allSelected ? "Limpar" : "Dia todo"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {HORARIOS.map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => toggleHorario(key, h)}
                              className={`px-2 py-1 rounded text-xs font-medium transition ${
                                selected.includes(h)
                                  ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-500"
                                  : "bg-zinc-800 border border-zinc-700 text-zinc-500 hover:border-zinc-600"
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.disponibilidade && <p className={errorCls}>{errors.disponibilidade.message}</p>}
              </div>
            </div>
          )}

          {/* ╔══════════ STEP 5 — Plano & Financeiro ══════════╗ */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Seleção de plano */}
              {!conviteValidated ? (
                <div>
                  <label className={labelCls}>Escolha seu plano</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { value: "start", label: "Start", price: "R$ 29,90/mês", Icon: Rocket },
                      { value: "pro", label: "Pro", price: "R$ 49,90/mês", Icon: Star, recommended: true },
                      { value: "elite", label: "Elite", price: "R$ 99,90/mês", Icon: Crown },
                    ].map(({ value, label, price, Icon, recommended }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue("plano", value, { shouldValidate: true })}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                          w.plano === value
                            ? "border-yellow-500 bg-yellow-500/10"
                            : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        {recommended && (
                          <span className="absolute -top-2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded-full">
                            Recomendado
                          </span>
                        )}
                        <Icon className={`w-6 h-6 ${w.plano === value ? "text-yellow-500" : "text-zinc-400"}`} />
                        <span className={`text-sm font-bold ${w.plano === value ? "text-yellow-500" : "text-white"}`}>
                          {label}
                        </span>
                        <span className="text-xs text-zinc-500">{price}</span>
                      </button>
                    ))}
                  </div>
                  {errors.plano && <p className={errorCls}>{errors.plano.message}</p>}
                  <Link
                    href="/personal#planos"
                    target="_blank"
                    className="text-xs text-yellow-500 hover:text-yellow-400 mt-2 inline-block"
                  >
                    Ver benefícios de cada plano →
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" /> Convite aplicado — Plano Pro (2 meses grátis)
                  </p>
                </div>
              )}

              {/* Cupom - só para quem não usou convite */}
              {!conviteValidated && w.plano && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCupom(!showCupom)}
                    className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 transition"
                  >
                    <Ticket className="w-4 h-4" />
                    {showCupom ? "Esconder campo de cupom" : "Tenho um cupom de desconto"}
                  </button>
                  {showCupom && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={cupomInput}
                        onChange={(e) => {
                          setCupomInput(e.target.value.toUpperCase());
                          setCupomStatus({});
                        }}
                        placeholder="Código do cupom"
                        className={`${inputCls} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={validarCupom}
                        className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:border-yellow-500 transition"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}
                  {cupomStatus.valido && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {cupomStatus.descricao}
                    </p>
                  )}
                  {cupomStatus.erro && (
                    <p className="text-red-400 text-xs mt-2">{cupomStatus.erro}</p>
                  )}
                </div>
              )}

              <hr className="border-zinc-800" />

              {/* Convite in-form (para quem NÃO veio de ?convite=1) */}
              {!conviteValidated && (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showConvite) {
                        setShowConvite(true);
                      } else {
                        setShowConvite(false);
                        setConviteStatus({});
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 transition"
                  >
                    <Gift className="w-4 h-4" />
                    {showConvite ? "Esconder verificação de convite" : "Tenho um convite"}
                  </button>
                  {showConvite && !conviteStatus.valido && (
                    <div className="mt-3">
                      <p className="text-xs text-zinc-500 mb-2">
                        Vamos verificar se há um convite vinculado ao seu CPF ({w.cpf || "preencha no passo 2"}).
                      </p>
                      <button
                        type="button"
                        onClick={validarConvite}
                        className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:border-yellow-500 transition"
                      >
                        Verificar convite pelo CPF
                      </button>
                    </div>
                  )}
                  {conviteStatus.valido && (
                    <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-green-400 text-sm flex items-center gap-1">
                        <Check className="w-3 h-3" /> {conviteStatus.msg}
                      </p>
                      <p className="text-zinc-400 text-xs mt-1">
                        Seu plano foi alterado para Pro com 2 meses grátis.
                      </p>
                    </div>
                  )}
                  {conviteStatus.erro && (
                    <p className="text-red-400 text-xs mt-2">{conviteStatus.erro}</p>
                  )}
                </div>
              )}

              <hr className="border-zinc-800" />

              <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 mb-2">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Para receber seus pagamentos, precisamos dos seus dados de PIX.
                  <strong className="text-zinc-200"> Só aceitamos PIX</strong> e a conta precisa estar{" "}
                  <strong className="text-zinc-200">no seu nome</strong>. Não realizamos depósitos em nome de
                  terceiros.
                </p>
              </div>

              <div>
                <label className={labelCls}>Tipo de chave PIX</label>
                <select
                  {...register("tipoChavePix", {
                    onChange: (e) => {
                      if (e.target.value === "cpf" && w.cpf) {
                        setValue("chavePix", w.cpf, { shouldValidate: true });
                      } else if (w.chavePix === w.cpf) {
                        setValue("chavePix", "");
                      }
                    },
                  })}
                  className={`${inputCls} appearance-none`}
                  defaultValue=""
                >
                  <option value="" disabled>Selecione</option>
                  <option value="cpf">CPF</option>
                  <option value="celular">Celular</option>
                  <option value="email">E-mail</option>
                  <option value="aleatoria">Chave aleatória</option>
                </select>
                {errors.tipoChavePix && <p className={errorCls}>{errors.tipoChavePix.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Chave PIX</label>
                <input
                  {...register("chavePix")}
                  className={inputCls}
                  readOnly={w.tipoChavePix === "cpf"}
                  placeholder={
                    w.tipoChavePix === "cpf"
                      ? "Preenchido automaticamente com seu CPF"
                      : w.tipoChavePix === "celular"
                      ? "(11) 91234-5678"
                      : w.tipoChavePix === "email"
                      ? "seu@email.com"
                      : "Cole sua chave aleatória"
                  }
                />
                {w.tipoChavePix === "cpf" && (
                  <p className="text-zinc-600 text-xs mt-1">Preenchido automaticamente — não aceitamos PIX de terceiros.</p>
                )}
                {errors.chavePix && <p className={errorCls}>{errors.chavePix.message}</p>}
              </div>

              {/* Confirmações */}
              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("confirmaPixProprio")}
                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 accent-yellow-500 mt-0.5"
                  />
                  <span className="text-sm text-zinc-300 leading-relaxed">
                    Confirmo que esta chave PIX está registrada <strong className="text-white">no meu nome</strong> e que a
                    conta bancária vinculada é minha.
                  </span>
                </label>
                {errors.confirmaPixProprio && <p className={`${errorCls} ml-8`}>{errors.confirmaPixProprio.message}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("aceitaTaxa")}
                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 accent-yellow-500 mt-0.5"
                  />
                  <span className="text-sm text-zinc-300 leading-relaxed">
                    Estou ciente de que será cobrada uma <strong className="text-white">taxa de 0,99%</strong> por
                    transação concluída na plataforma.
                  </span>
                </label>
                {errors.aceitaTaxa && <p className={`${errorCls} ml-8`}>{errors.aceitaTaxa.message}</p>}
              </div>
            </div>
          )}

          {/* ── Erro da API ── */}
          {apiError && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {apiError}
            </div>
          )}

          {/* ── Navegação ── */}
          <div className="flex gap-4 mt-10">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-full font-semibold hover:border-zinc-500 transition"
              >
                Anterior
              </button>
            )}
            {step < STEP_FIELDS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Enviar para Análise
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-zinc-600 text-xs mt-10">
          Já tem conta?{" "}
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-semibold transition">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
