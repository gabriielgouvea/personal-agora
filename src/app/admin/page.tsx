import prisma from "@/lib/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminPage() {
  const trainers = await prisma.personalTrainer.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase italic">
              Admin <span className="text-yellow-500">Cadastros</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              Total: <span className="text-white font-semibold">{trainers.length}</span>
            </p>
          </div>

          <a
            href="/api/admin/export.csv"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition"
          >
            Baixar CSV
          </a>
        </div>

        <div className="mt-8 overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-zinc-900/60 text-zinc-200">
              <tr>
                <th className="text-left p-3">Criado</th>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">WhatsApp</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">CREF</th>
                <th className="text-left p-3">Academias</th>
                <th className="text-left p-3">Residencial</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t) => (
                <tr key={t.id} className="border-t border-zinc-900 hover:bg-zinc-900/30">
                  <td className="p-3 whitespace-nowrap text-zinc-300">{formatDateTime(t.createdAt)}</td>
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3 text-zinc-300 whitespace-nowrap">{t.whatsapp}</td>
                  <td className="p-3 text-zinc-300">{t.email}</td>
                  <td className="p-3 text-zinc-300 whitespace-nowrap">{t.cref}</td>
                  <td className="p-3 text-zinc-300">{t.academies}</td>
                  <td className="p-3 text-zinc-300 whitespace-nowrap">
                    {t.residentialAvailable ? "Sim" : "Não"}
                  </td>
                </tr>
              ))}

              {trainers.length === 0 && (
                <tr>
                  <td className="p-6 text-zinc-400" colSpan={7}>
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Dica: compartilhe o link <span className="text-zinc-300">/admin</span> apenas com quem deve ver os cadastros.
        </p>
      </div>
    </main>
  );
}
