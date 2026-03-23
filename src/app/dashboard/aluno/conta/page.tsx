"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Save,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { maskPhone, maskCEP, maskCPF, maskDate } from "@/lib/masks";

const inputCls =
  "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition";
const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";

export default function MinhaContaPage() {
  // TODO: puxar dados reais do usuário autenticado
  const [form, setForm] = useState({
    nome: "Gabriel",
    sobrenome: "Gouvea",
    email: "gabriel@email.com",
    telefone: "(11) 91234-5678",
    isWhatsapp: true,
    isTelefone: false,
    dataNascimento: "15/03/1995",
    sexo: "masculino",
    cpf: "123.456.789-00",
    cep: "06454-000",
    rua: "Alameda Rio Negro",
    bairro: "Alphaville Industrial",
    cidade: "Barueri",
    estado: "SP",
    numero: "500",
    complemento: "Sala 12",
    avatar: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setSaved(false);
      // TODO: upload real do avatar
    }
  }

  async function handleSave() {
    setSaving(true);
    // TODO: enviar para API
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  }

  const initials = `${form.nome[0]}${form.sobrenome[0]}`.toUpperCase();

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <Link
        href="/dashboard/aluno"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-yellow-500 text-sm mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-3xl font-black uppercase italic tracking-tight mb-8">
        Minha <span className="text-yellow-500">Conta</span>
      </h1>

      {/* ── Avatar ── */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
            {avatarPreview || form.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview || form.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-zinc-400">{initials}</span>
            )}
          </div>
          <button
            onClick={() => avatarRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-white font-semibold">
            {form.nome} {form.sobrenome}
          </p>
          <p className="text-zinc-500 text-sm">{form.email}</p>
          <button
            onClick={() => avatarRef.current?.click()}
            className="text-yellow-500 text-xs font-medium mt-1 hover:text-yellow-400 transition"
          >
            Alterar foto
          </button>
        </div>
      </div>

      {/* ── Formulário ── */}
      <div className="space-y-6">
        {/* Dados pessoais */}
        <section>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
            Dados Pessoais
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nome</label>
                <input
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Sobrenome</label>
                <input
                  value={form.sobrenome}
                  onChange={(e) => update("sobrenome", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>E-mail</label>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                type="email"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Data de Nascimento</label>
                <input
                  value={form.dataNascimento}
                  onChange={(e) =>
                    update("dataNascimento", maskDate(e.target.value))
                  }
                  className={inputCls}
                  placeholder="DD/MM/AAAA"
                />
              </div>
              <div>
                <label className={labelCls}>Sexo</label>
                <select
                  value={form.sexo}
                  onChange={(e) => update("sexo", e.target.value)}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Prefiro não dizer</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>CPF</label>
              <input
                value={form.cpf}
                onChange={(e) => update("cpf", maskCPF(e.target.value))}
                className={`${inputCls} bg-zinc-900 text-zinc-500`}
                readOnly
              />
              <p className="text-zinc-600 text-xs mt-1">
                CPF não pode ser alterado
              </p>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
            Contato
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) =>
                  update("telefone", maskPhone(e.target.value))
                }
                className={inputCls}
              />
              <div className="flex gap-6 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isWhatsapp}
                    onChange={(e) => update("isWhatsapp", e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                  />
                  <span className="text-sm text-zinc-300">WhatsApp</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isTelefone}
                    onChange={(e) => update("isTelefone", e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-yellow-500"
                  />
                  <span className="text-sm text-zinc-300">Telefone</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
            Endereço
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>CEP</label>
                <input
                  value={form.cep}
                  onChange={(e) => update("cep", maskCEP(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Número</label>
                <input
                  value={form.numero}
                  onChange={(e) => update("numero", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Rua</label>
                <input
                  value={form.rua}
                  className={`${inputCls} bg-zinc-900`}
                  readOnly
                />
              </div>
              <div>
                <label className={labelCls}>Bairro</label>
                <input
                  value={form.bairro}
                  className={`${inputCls} bg-zinc-900`}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Cidade</label>
                <input
                  value={form.cidade}
                  className={`${inputCls} bg-zinc-900`}
                  readOnly
                />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <input
                  value={form.estado}
                  className={`${inputCls} bg-zinc-900`}
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Complemento</label>
              <input
                value={form.complemento}
                onChange={(e) => update("complemento", e.target.value)}
                className={inputCls}
                placeholder="Apto, bloco..."
              />
            </div>
          </div>
        </section>
      </div>

      {/* ── Save ── */}
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <>
              <Check className="w-5 h-5" /> Salvo!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Salvar Alterações
            </>
          )}
        </button>
        {saved && (
          <span className="text-green-400 text-sm">
            Suas informações foram atualizadas.
          </span>
        )}
      </div>
    </div>
  );
}
