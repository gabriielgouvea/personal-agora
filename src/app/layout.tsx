import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Agora — Encontre seu Personal Trainer em Alphaville",
  description:
    "Plataforma que conecta alunos a personal trainers verificados na região de Alphaville. Busque por academia ou região, agende aulas avulsas ou planos mensais com pagamento seguro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-black text-white antialiased selection:bg-yellow-500 selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
