import RegistrationForm from "@/components/RegistrationForm";

export default function CadastroPage() {
  return (
    <main className="min-h-screen bg-black selection:bg-yellow-500 selection:text-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-yellow-600/10 blur-[100px] rounded-full -translate-y-1/2"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-screen">
        
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-900/50 p-8 text-center border-b border-zinc-800">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-white mb-1 uppercase italic">
                    Cadastro de <span className="text-yellow-500">Profissional</span>
                </h1>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">
                    ETAPA ÚNICA
                </p>
            </div>

            {/* Form Container */}
            <div className="p-5 md:p-8">
                <RegistrationForm />
            </div>
        </div>

        <footer className="mt-8 text-zinc-600 text-xs text-center">
            &copy; {new Date().getFullYear()} Personal Agora. Todos os direitos reservados.
        </footer>
      </div>
    </main>
  );
}