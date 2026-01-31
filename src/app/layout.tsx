import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Agora - Cadastro de Profissionais",
  description: "Cadastro de personal trainers para a plataforma Personal Agora - Ironberg Alphaville",
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
