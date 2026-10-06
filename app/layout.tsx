import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clara Odontologia — Seu sorriso, com mais leveza",
  description: "Conheça o jeito Clara de cuidar: acolhimento, prevenção, estética dental, alinhadores e implantes. Clínica fictícia com agendamento demonstrativo.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
