import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DataQuest: A Guilda dos Arquivistas",
  description: "Plataforma gamificada de aprendizado em Python, SQL, Pandas e Data Visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${pressStart.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
