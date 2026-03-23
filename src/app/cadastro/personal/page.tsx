"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
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
} from "lucide-react";
import PasswordField from "@/components/PasswordField";
import {
  maskPhone,
  maskCEP,
  maskCPF,
  maskDate,
  unmask,
  fetchAddressByCep,
} from "@/lib/masks";

/* ── Placeholder academias ── */
const ACADEMIAS = [
  "Ironberg Alphaville",
  "Ironberg Barra Funda",
  "Ironberg São Caetano",
  "Ironberg Pinheiros",
  "Bluefit Alphaville",
  "Bluefit Barueri",
  "Smart Fit Alphaville",
  "Smart Fit Tamboré",
  "Bio Ritmo Alphaville",
  "Bodytech Alphaville",
  "Companhia Athletica Alphaville",
  "Runner Alphaville",
];

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
    academias: z.array(z.string()),
    disponivelEmCasa: z.boolean(),
    valorAproximado: z.string().min(1, "Informe um valor"),
    /* 5 — Financeiro */
    tipoChavePix: z.string().min(1, "Selecione"),
    chavePix: z.string().min(3, "Informe a chave"),
    confirmaPixProprio: z.literal(true, {
      errorMap: () => ({ message: "Confirme que o PIX é seu" }),
    }),
    aceitaTaxa: z.literal(true, {
      errorMap: () => ({ message: "Aceite os termos" }),
    }),
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
  ["valorAproximado"],
  ["tipoChavePix", "chavePix", "confirmaPixProprio", "aceitaTaxa"],
];

const STEP_LABELS = ["Conta", "Pessoal", "Documentos", "Trabalho", "Financeiro"];

/* ── Estilos ── */
const inputCls =
  "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition";
const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";
const errorCls = "text-red-400 text-xs mt-1";

export default function CadastroPersonalPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  /* uploads locais (preview) */
  const [fotoCref, setFotoCref] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const fotoCrefRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  /* academia search */
  const [acSearch, setAcSearch] = useState("");
  const [acOpen, setAcOpen] = useState(false);
  const acRef = useRef<HTMLDivElement>(null);

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
      disponivelEmCasa: false,
      rua: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: "",
      confirmaPixProprio: false as unknown as true,
      aceitaTaxa: false as unknown as true,
    },
  });

  const w = watch();

  /* fechar dropdown academia */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (acRef.current && !acRef.current.contains(e.target as Node)) setAcOpen(false);
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
    if (valid) setStep((s) => s + 1);
  }

  /* ── Submit ── */
  async function onSubmit(data: FormData) {
    // TODO: enviar para API + upload de arquivos
    console.log("personal", data, { fotoCref, selfie });
    setDone(true);
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

  /* ── Academia toggles ── */
  function addAcademia(a: string) {
    const cur = w.academias || [];
    if (!cur.includes(a)) setValue("academias", [...cur, a]);
    setAcSearch("");
    setAcOpen(false);
  }
  function removeAcademia(a: string) {
    setValue("academias", (w.academias || []).filter((x) => x !== a));
  }
  const filteredAc = ACADEMIAS.filter(
    (a) =>
      acSearch.length >= 2 &&
      a.toLowerCase().includes(acSearch.toLowerCase()) &&
      !(w.academias || []).includes(a)
  );

  /* ── Preview de arquivo ── */
  function filePreview(file: File | null) {
    if (!file) return null;
    if (file.type.startsWith("image/")) return URL.createObjectURL(file);
    return null;
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
                  onChange={(e) => setValue("cpf", maskCPF(e.target.value))}
                />
                {errors.cpf && <p className={errorCls}>{errors.cpf.message}</p>}
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
                    type="month"
                    className={inputCls}
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
              {/* Academias */}
              <div ref={acRef}>
                <label className={labelCls}>Academias onde você já dá aula (matriculado e ativo)</label>
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
                  {acOpen && filteredAc.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                      {filteredAc.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => addAcademia(a)}
                          className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 transition"
                        >
                          {a}
                        </button>
                      ))}
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
                  Esse valor é apenas uma referência interna e <strong className="text-zinc-400">não aparecerá para o aluno</strong>.
                  Na hora de atender, você define o preço final com total autonomia, considerando dia, horário
                  e tipo de aula.
                </p>
              </div>
            </div>
          )}

          {/* ╔══════════ STEP 5 — Financeiro ══════════╗ */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
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
                  {...register("tipoChavePix")}
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
                  placeholder={
                    w.tipoChavePix === "cpf"
                      ? "000.000.000-00"
                      : w.tipoChavePix === "celular"
                      ? "(11) 91234-5678"
                      : w.tipoChavePix === "email"
                      ? "seu@email.com"
                      : "Cole sua chave aleatória"
                  }
                />
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
                    Criar Conta
                    <Check className="w-4 h-4" />
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
