"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function EntrarComoPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EntrarComoContent />
    </Suspense>
  );
}

function Spinner() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
    </div>
  );
}

function EntrarComoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const tipo = searchParams.get("tipo");

    if (!token || !tipo) {
      setError("Link inválido.");
      return;
    }

    fetch("/api/admin/impersonate/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const dest = tipo === "personal" ? "/dashboard/personal" : "/dashboard/aluno";
        router.replace(dest);
      })
      .catch(() => setError("Erro de conexão."));
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center px-6">
        <div>
          <p className="text-red-400 text-lg font-bold">Erro</p>
          <p className="text-zinc-500 text-sm mt-2">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-yellow-500 text-sm underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
      <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      <p className="text-zinc-400 text-sm">Entrando como usuário...</p>
    </div>
  );
}
