"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2, Dumbbell, AlertCircle, User, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDropzone } from "@/lib/uploadthing";

// Função para converter DD/MM/YYYY para YYYY-MM-DD
const convertDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return "";
    return `${year}-${month}-${day}`;
};

// Validar se é uma data válida DD/MM/YYYY
const isValidDate = (dateStr: string) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateStr)) return false;
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  dateOfBirth: z.string().refine(isValidDate, "Data inválida (DD/MM/AAAA)"),
  photoUrl: z.string().optional(),
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
  crefValidity: z.string().refine(isValidDate, "Data inválida (DD/MM/AAAA)"),
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
  const [imageUrl, setImageUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      residentialAvailable: false,
      contactConsent: false
    }
  });

  // Função para máscara de data
  const handleDateMask = (e: React.ChangeEvent<HTMLInputElement>, name: "dateOfBirth" | "crefValidity") => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5, 9);
    e.target.value = value;
    setValue(name, value, { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setServerError("");
    
    // Converter datas para o formato ISO YYYY-MM-DD que o backend espera
    const payload = {
        ...data,
        photoUrl: imageUrl,
        dateOfBirth: convertDate(data.dateOfBirth),
        crefValidity: convertDate(data.crefValidity),
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

        {/* Foto de Perfil - Ajustado para Responsividade */}
        <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Foto de Perfil</label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-zinc-900 border border-zinc-700 rounded-xl relative overflow-hidden">
                 {/* Fundo decorativo sutil */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative w-28 h-28 bg-zinc-800 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl flex items-center justify-center shrink-0 group">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Foto de perfil" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <User className="w-10 h-10 text-zinc-500" />
                    )}

              {uploadStatus === "success" && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center border-2 border-zinc-900 shadow-lg">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {uploadStatus === "uploading" && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                </div>
              )}
                </div>
                
                <div className="flex-1 w-full text-center sm:text-left">
                    <UploadDropzone
                        endpoint="imageUploader"
                onUploadBegin={() => {
                  setUploadStatus("uploading");
                  setUploadProgress(0);
                }}
                onUploadProgress={(p) => {
                  setUploadStatus("uploading");
                  setUploadProgress(p);
                }}
                        onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                                setImageUrl(res[0].url);
                                setValue("photoUrl", res[0].url);
                    setUploadProgress(100);
                    setUploadStatus("success");
                            }
                        }}
                        onUploadError={(error: Error) => {
                  setUploadStatus("error");
                            alert(`ERRO! ${error.message}`);
                        }}
                        appearance={{
                            container: "border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition duration-300 rounded-lg p-6 cursor-pointer w-full flex flex-col items-center justify-center gap-2 max-w-sm mx-auto sm:mx-0",
                            label: "text-zinc-400 text-sm font-medium hover:text-yellow-500 transition-colors pointer-events-none",
                            allowedContent: "text-zinc-600 text-xs pointer-events-none",
                            button: "bg-yellow-500 text-black font-bold text-xs py-2 px-4 rounded-full mt-2 hover:bg-yellow-400 transition cursor-pointer pointer-events-none"
                        }}
                        content={{
                  label:
                    uploadStatus === "uploading"
                      ? `Enviando... ${uploadProgress}%`
                      : uploadStatus === "success"
                        ? "Foto enviada com sucesso"
                        : "Arraste sua foto ou clique aqui",
                            allowedContent: "Max 4MB (JPG, PNG)",
                  button: uploadStatus === "success" ? "Trocar Foto" : "Selecionar Arquivo"
                        }}
                    />

              {uploadStatus !== "idle" && (
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs">
                  {uploadStatus === "uploading" && (
                    <>
                      <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                      <span className="text-zinc-400">Upload em andamento ({uploadProgress}%)</span>
                    </>
                  )}
                  {uploadStatus === "success" && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Foto anexada</span>
                    </>
                  )}
                  {uploadStatus === "error" && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-300">Falha ao enviar a foto</span>
                    </>
                  )}
                </div>
              )}

                     <p className="text-xs text-zinc-500 mt-4 leading-relaxed max-w-sm mx-auto sm:mx-0">
                        A foto é o seu cartão de visita. Escolha uma imagem com boa iluminação e aparência profissional.
                    </p>
                </div>
            </div>
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
                    type="tel"
                    maxLength={10}
                    placeholder="DD/MM/AAAA"
                    {...register("dateOfBirth")}
                    onChange={(e) => handleDateMask(e, "dateOfBirth")}
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
                    type="tel"
                    maxLength={10}
                    placeholder="DD/MM/AAAA"
                    {...register("crefValidity")}
                    onChange={(e) => handleDateMask(e, "crefValidity")}
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
                    Termos de Uso e Privacidade
                </label>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    Autorizo a exibição do meu perfil publicamente na plataforma <strong>Personal Agora</strong>, bem como o contato da equipe para fins de gerenciamento e novidades.
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
