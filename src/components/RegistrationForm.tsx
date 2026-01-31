"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2, Dumbbell, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  dateOfBirth: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.enum(["masculino", "feminino", "outro"], { errorMap: () => ({ message: "Selecione o sexo" }) }),
  studentGenderPreference: z.enum([
    "somente_masculino",
    "somente_feminino",
    "todos",
    "todos_pref_mulher",
    "todos_pref_homem"
  ], { errorMap: () => ({ message: "Selecione uma preferência" }) }),
  academies: z.string().min(1, "Campo obrigatório"),
  residentialAvailable: z.boolean(),
  cref: z.string().min(6, "Mínimo 6 caracteres").max(11, "Máximo 11 caracteres"),
  crefValidity: z.string().min(1, "Data de validade é obrigatória"),
  whatsapp: z.string().min(10, "Informe um número válido"),
  email: z.string().email("Informe um email válido"),
  instagram: z.string().optional(),
  contactConsent: z.boolean().refine(val => val === true, "Você precisa autorizar o contato"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      residentialAvailable: false,
      contactConsent: false
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setServerError("");
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Erro desconhecido");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-zinc-900 rounded-lg border border-yellow-600/30 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Cadastro Recebido!</h2>
        <p className="text-zinc-400">
            A plataforma está sendo finalizada e em breve entraremos em contato com mais detalhes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Nome Completo</label>
          <input
            {...register("name")}
            className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition", errors.name && "border-red-500 focus:ring-red-500")}
            placeholder="Seu nome"
          />
          {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
        </div>

        {/* Whatsapp e Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">WhatsApp</label>
                <input
                    {...register("whatsapp")}
                    className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition", errors.whatsapp && "border-red-500")}
                    placeholder="(11) 99999-9999"
                />
                {errors.whatsapp && <span className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</span>}
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                <input
                    {...register("email")}
                    className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition", errors.email && "border-red-500")}
                    placeholder="seu@email.com"
                />
                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
            </div>
        </div>

        {/* Instagram */}
        <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Instagram <span className="text-zinc-500 text-xs ml-1">(Opcional)</span></label>
            <input
                {...register("instagram")}
                className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition")}
                placeholder="@seuusuario"
            />
        </div>

        {/* Data de Nascimento & Sexo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Data de Nascimento</label>
                <input
                    type="date"
                    {...register("dateOfBirth")}
                    className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition", errors.dateOfBirth && "border-red-500")}
                />
                {errors.dateOfBirth && <span className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Sexo</label>
                <select
                    {...register("gender")}
                    className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition appearance-none", errors.gender && "border-red-500")}
                >
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                </select>
                {errors.gender && <span className="text-red-500 text-xs mt-1">{errors.gender.message}</span>}
            </div>
        </div>

        {/* CREF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">CREF</label>
                <div className="relative">
                    <Dumbbell className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input
                        {...register("cref")}
                        maxLength={11}
                        className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 pl-10 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition", errors.cref && "border-red-500")}
                        placeholder="000000-G/SP"
                    />
                </div>
                {errors.cref && <span className="text-red-500 text-xs mt-1">{errors.cref.message}</span>}
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Validade do CREF</label>
                <input
                    type="date"
                    {...register("crefValidity")}
                    className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition", errors.crefValidity && "border-red-500")}
                />
                {errors.crefValidity && <span className="text-red-500 text-xs mt-1">{errors.crefValidity.message}</span>}
            </div>
        </div>

        {/* Preferência de Alunos */}
        <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Preferência de Alunos</label>
            <select
                {...register("studentGenderPreference")}
                className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition appearance-none", errors.studentGenderPreference && "border-red-500")}
            >
                <option value="">Selecione...</option>
                <option value="somente_masculino">Somente sexo masculino</option>
                <option value="somente_feminino">Somente sexo feminino</option>
                <option value="todos">Todos os sexos</option>
                <option value="todos_pref_mulher">Todos, mas prefiro mulher</option>
                <option value="todos_pref_homem">Todos, mas prefiro homem</option>
            </select>
            {errors.studentGenderPreference && <span className="text-red-500 text-xs mt-1">{errors.studentGenderPreference.message}</span>}
        </div>

        {/* Academias */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Quais academias você está disponível em Alphaville? 
            <span className="block text-zinc-500 text-xs font-normal">
                (Cite apenas as que você é devidamente cadastrado e tem uniforme)
            </span>
          </label>
          <textarea
            {...register("academies")}
            rows={3}
            className={cn("w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition", errors.academies && "border-red-500")}
            placeholder="Ex: Ironberg, Bluefit, Smart Fit..."
          />
          {errors.academies && <span className="text-red-500 text-xs mt-1">{errors.academies.message}</span>}
        </div>

        {/* Disponibilidade Residencial */}
        <div className="flex items-center space-x-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <input
                type="checkbox"
                id="residentialAvailable"
                {...register("residentialAvailable")}
                className="w-5 h-5 rounded border-zinc-700 text-yellow-500 focus:ring-yellow-500 bg-zinc-900 accent-yellow-500"
            />
            <label htmlFor="residentialAvailable" className="text-sm font-medium text-zinc-300 cursor-pointer select-none">
                Tenho disponibilidade para dar aula nos residenciais de Alphaville
            </label>
        </div>

        {/* Termo de Contato */}
        <div className="flex items-start space-x-3 p-4">
             <input
                type="checkbox"
                id="contactConsent"
                {...register("contactConsent")}
                className="w-5 h-5 mt-1 rounded border-zinc-700 text-yellow-500 focus:ring-yellow-500 bg-zinc-900 accent-yellow-500"
            />
            <div className="grid gap-1.5 leading-none">
                <label htmlFor="contactConsent" className="text-sm font-medium text-zinc-300 cursor-pointer select-none">
                    Autorizo o contato
                </label>
                <p className="text-xs text-zinc-500">
                    Ao marcar esta caixa, você permite que a equipe do Personal Agora entre em contato para tratar sobre o seu cadastro.
                </p>
                {errors.contactConsent && <span className="text-red-500 text-xs mt-1">{errors.contactConsent.message}</span>}
            </div>
        </div>

        {/* Server Error Message */}
        {serverError && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-md flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{serverError}</span>
            </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-md transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg uppercase tracking-wide"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Finalizar Cadastro"
          )}
        </button>
      </div>
      
      <p className="text-center text-xs text-zinc-600 mt-4">
        Seus dados estão seguros e serão utilizados apenas para fins de cadastro na plataforma Personal Agora.
      </p>
    </form>
  );
}
