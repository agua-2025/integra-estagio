import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Integra Estágio | Mirassol d'Oeste",
  description:
    "Programa de Estágio Curricular Supervisionado de Mirassol d'Oeste.",
  icons: {
    icon: [
      {
        url: "/branding/favicon.png?v=2",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/branding/favicon.png?v=2",
    apple: "/branding/favicon.png?v=2",
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
