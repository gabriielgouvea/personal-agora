"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUploadThing } from "@/lib/uploadthing";

export default function PersonalContaPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { startUpload } = useUploadThing("imageUploader");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setNome(d.nome || "");
        setSobrenome(d.sobrenome || "");
        setAvatarUrl(d.avatarUrl || null);
      })
      .catch(() => {});
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview imediato
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setSaved(false);

    try {
      const result = await startUpload([file]);
      const url = result?.[0]?.url;
      if (!url) throw new Error("Upload falhou");

      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      });

      setAvatarUrl(url);
      setPreview(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  const displayPhoto = preview || avatarUrl;
  const initials = nome && sobrenome ? `${nome[0]}${sobrenome[0]}`.toUpperCase() : "?";

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/personal" className="p-2 rounded-lg hover:bg-zinc-900 transition text-zinc-500 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Minha Conta</h1>
          <p className="text-zinc-500 text-sm">Gerencie sua foto de perfil</p>
        </div>
      </div>

      {/* Foto de perfil */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-5 uppercase tracking-wider">Foto de Perfil</h2>

        <div className="flex flex-col items-center gap-5">
          {/* Avatar grande */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayPhoto}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-zinc-500">{initials}</span>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
              </div>
            )}
            {saved && !uploading && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-black">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="font-semibold text-white">{nome} {sobrenome}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Personal Trainer</p>
          </div>

          {/* Info */}
          <div className="w-full p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
            <p className="text-xs text-yellow-400/80 leading-relaxed text-center">
              📸 Sua foto aparece para <strong className="text-yellow-400">todos os alunos</strong> na busca de personais. 
              Uma boa foto profissional aumenta muito suas chances de ser escolhido.
            </p>
          </div>

          {/* Botão */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition disabled:opacity-60"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              <><Camera className="w-4 h-4" /> {avatarUrl ? "Trocar Foto" : "Adicionar Foto"}</>
            )}
          </button>

          {saved && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Foto atualizada com sucesso!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
