import type { Metadata } from "next";
import { Fira_Code, Open_Sans } from "next/font/google";
import { SoundProvider } from "@/audio/SoundProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";

import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const deploymentUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title: {
    default: "Natan Oliveira — Desenvolvedor Full Stack",
    template: "%s — Natan Oliveira",
  },
  description:
    "Portfólio de Natan de Souza Oliveira, desenvolvedor full stack orientado a produto. Experiências digitais do planejamento ao deploy.",
  applicationName: "Workspace de Natan Oliveira",
  authors: [{ name: "Natan de Souza Oliveira" }],
  creator: "Natan de Souza Oliveira",
  keywords: [
    "Natan Oliveira",
    "desenvolvedor full stack",
    "desenvolvimento de produto",
    "Next.js",
    "TypeScript",
    "React",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Natan Oliveira — Produtos digitais, pensados por inteiro",
    description:
      "Entre no workspace de um desenvolvedor full stack que conecta produto, experiência e engenharia.",
    siteName: "Natan Oliveira",
  },
  twitter: {
    card: "summary_large_image",
    title: "Natan Oliveira — Desenvolvedor Full Stack",
    description: "Produtos digitais do primeiro diagrama ao deploy.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${firaCode.variable} ${openSans.variable}`}
    >
      <body>
        <LanguageProvider>
          <SoundProvider>{children}</SoundProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
