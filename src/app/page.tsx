import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-black selection:bg-yellow-500 selection:text-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-yellow-600/10 blur-[100px] rounded-full -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-full h-96 bg-zinc-800/20 blur-[100px] rounded-full translate-y-1/2"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-screen">
        
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-900/50 p-8 text-center border-b border-zinc-800">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-1 uppercase italic">
                    Personal <span className="text-yellow-500">Agora</span>
                </h1>
                <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
                    Ironberg Alphaville
                </p>
                
                <div className="mt-6 space-y-2">
                    <h2 className="text-xl font-semibold text-white">Cadastro de Profissionais</h2>
                    <p className="text-zinc-400 text-sm max-w-md mx-auto">
                        Entre para o banco de talentos do Personal Agora e conecte-se com alunos que precisam de você.
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <div className="p-6 md:p-8">
                <RegistrationForm />
            </div>
        </div>

        <footer className="mt-8 text-zinc-600 text-sm text-center">
            &copy; {new Date().getFullYear()} Personal Agora. MVP Exclusivo.
        </footer>
      </div>
    </main>
  );
}
