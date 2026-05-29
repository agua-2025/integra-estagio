import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Integra Estágio | Mirassol d'Oeste",
  description:
    "Programa de Estágio Curricular Supervisionado de Mirassol d'Oeste.",
  icons: {
    icon: "/branding/favicon.png",
    shortcut: "/branding/favicon.png",
    apple: "/branding/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
