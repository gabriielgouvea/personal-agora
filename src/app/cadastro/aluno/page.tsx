"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  X,
  Search,
  AlertTriangle,
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

/* ── Placeholder academias (admin cadastra depois) ── */
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

const ESPORTES = ["Musculação", "Mobilidade", "Treino Funcional"] as const;

/* ── Schema ── */
const schema = z
  .object({
    nome: z.string().min(2, "Mínimo 2 caracteres"),
    sobrenome: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(6, "Mínimo 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
    telefone: z.string().min(14, "Telefone inválido"),
    isWhatsapp: z.boolean(),
    isTelefone: z.boolean(),
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
    esportes: z.array(z.string()).min(1, "Selecione pelo menos um"),
    academias: z.array(z.string()),
    temWellhub: z.boolean(),
    temTotalPass: z.boolean(),
    experiencia: z.string().min(1, "Selecione"),
    tempoTreino: z.string().optional(),
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

/* campos obrigatórios por step (para trigger) */
const STEP_FIELDS: (keyof FormData)[][] = [
  ["nome", "sobrenome", "email", "senha", "confirmarSenha", "telefone"],
  ["dataNascimento", "sexo", "cpf", "cep", "numero"],
  ["esportes", "experiencia"],
];

const STEP_LABELS = ["Conta", "Pessoal", "Treino"];

/* ── Estilos reutilizáveis ── */
const inputCls =
  "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition";
const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";
const errorCls = "text-red-400 text-xs mt-1";

export default function CadastroAlunoPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [apiError, setApiError] = useState("");
  const [duplicateInfo, setDuplicateInfo] = useState<{
    field: string;
    message: string;
  } | null>(null);
  const router = useRouter();

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
      esportes: [],
      academias: [],
      temWellhub: false,
      temTotalPass: false,
      experiencia: "",
      tempoTreino: "",
      rua: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: "",
    },
  });

  const w = watch();

  /* fechar dropdown academia ao clicar fora */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (acRef.current && !acRef.current.contains(e.target as Node)) setAcOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Navegação entre steps ── */
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
    setApiError("");
    setDuplicateInfo(null);
    try {
      const res = await fetch("/api/cadastro/aluno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error === "duplicate") {
          setDuplicateInfo({ field: json.field, message: json.message });
          // Voltar pro step onde o campo duplicado está
          if (json.field === "email" || json.field === "telefone") setStep(0);
          if (json.field === "cpf") setStep(1);
          return;
        }
        setApiError(json.error || "Erro ao criar conta.");
        return;
      }

      setDone(true);
    } catch {
      setApiError("Erro de conexão. Tente novamente.");
    }
  }

  /* ── CEP auto-fill ── */
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

  /* ── Toggles ── */
  function toggleEsporte(e: string) {
    const cur = w.esportes || [];
    setValue("esportes", cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e], {
      shouldValidate: true,
    });
  }

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

  /* ── Tela de sucesso ── */
  if (done) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 selection:bg-yellow-500 selection:text-black">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight mb-4">
            Cadastro realizado!
          </h1>
          <p className="text-zinc-400 mb-8">
            Sua conta foi criada com sucesso. Vamos te levar para o painel!
          </p>
          <button
            onClick={() => router.push("/dashboard/aluno")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition hover:scale-105 active:scale-95"
          >
            Ir para o Painel
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    );
  }

  /* ── Formulário ── */
  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 md:px-6 selection:bg-yellow-500 selection:text-black">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <Link
          href="/cadastro"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="text-3xl font-black uppercase italic tracking-tight mb-1">
          Cadastro de <span className="text-yellow-500">Aluno</span>
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Passo {step + 1} de {STEP_LABELS.length}
        </p>

        {/* ── Stepper ── */}
        <div className="flex items-center gap-2 mb-10">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  i <= step ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded ${i < step ? "bg-yellow-500" : "bg-zinc-800"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* ── Alertas ── */}
          {duplicateInfo && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-200 font-medium">
                    {duplicateInfo.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: implementar recuperação de conta
                      alert("Em breve! Estamos trabalhando na recuperação de conta. 🚀");
                    }}
                    className="text-yellow-500 text-sm font-bold hover:text-yellow-400 mt-2 underline underline-offset-2 transition"
                  >
                    Clique aqui para recuperar sua conta →
                  </button>
                </div>
              </div>
            </div>
          )}
          {apiError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{apiError}</p>
            </div>
          )}
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
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-yellow-500 focus:ring-yellow-500 accent-yellow-500"
                    />
                    <span className="text-sm text-zinc-300">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isTelefone")}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-yellow-500 focus:ring-yellow-500 accent-yellow-500"
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
                  <select
                    {...register("sexo")}
                    className={`${inputCls} appearance-none`}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
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

          {/* ╔══════════ STEP 3 — Treino ══════════╗ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Esportes */}
              <div>
                <label className={labelCls}>Qual modalidade procura?</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {ESPORTES.map((e) => {
                    const active = (w.esportes || []).includes(e);
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => toggleEsporte(e)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                          active
                            ? "bg-yellow-500 text-black border-yellow-500"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-yellow-500/50"
                        }`}
                      >
                        {e}
                      </button>
                    );
                  })}
                </div>
                {errors.esportes && <p className={errorCls}>{errors.esportes.message}</p>}
              </div>

              {/* Academias */}
              <div ref={acRef}>
                <label className={labelCls}>Em qual academia você treina?</label>
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

                {/* Selected */}
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

              {/* Wellhub / TotalPass */}
              <div>
                <label className={labelCls}>Benefícios</label>
                <div className="flex gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("temWellhub")}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                    />
                    <span className="text-sm text-zinc-300">Tenho Wellhub (Gympass)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("temTotalPass")}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                    />
                    <span className="text-sm text-zinc-300">Tenho TotalPass</span>
                  </label>
                </div>
              </div>

              {/* Experiência */}
              <div>
                <label className={labelCls}>Tempo de treino</label>
                <div className="flex flex-col gap-3 mt-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="iniciante"
                      {...register("experiencia")}
                      className="w-4 h-4 accent-yellow-500"
                    />
                    <span className="text-sm text-zinc-300">Estou começando agora</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="ja_treino"
                      {...register("experiencia")}
                      className="w-4 h-4 accent-yellow-500"
                    />
                    <span className="text-sm text-zinc-300">Já treino</span>
                  </label>
                </div>
                {errors.experiencia && <p className={errorCls}>{errors.experiencia.message}</p>}
              </div>

              {w.experiencia === "ja_treino" && (
                <div>
                  <label className={labelCls}>Há quanto tempo?</label>
                  <select
                    {...register("tempoTreino")}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="">Selecione</option>
                    <option value="menos_6">Menos de 6 meses</option>
                    <option value="6_12">6 meses a 1 ano</option>
                    <option value="1_2">1 a 2 anos</option>
                    <option value="2_5">2 a 5 anos</option>
                    <option value="mais_5">Mais de 5 anos</option>
                  </select>
                </div>
              )}
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

        {/* Footer */}
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
