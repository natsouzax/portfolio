import type { Metadata } from "next";
import { Fira_Code, Open_Sans, Unbounded } from "next/font/google";
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

const unbounded = Unbounded({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const deploymentUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title: {
    default: "odevntzn — Natan Oliveira | Full Stack Developer",
    template: "%s — odevntzn",
  },
  description:
    "Portfolio of Natan de Souza Oliveira, a product-minded full stack developer building digital experiences from idea to launch.",
  applicationName: "odevntzn — Natan Oliveira",
  authors: [{ name: "Natan de Souza Oliveira" }],
  creator: "Natan de Souza Oliveira",
  keywords: [
    "odevntzn",
    "Natan Oliveira",
    "full stack developer",
    "product development",
    "Next.js",
    "TypeScript",
    "React",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    title: "odevntzn — Digital products, made real",
    description: "Explore the work and practice of Natan Oliveira, a product-minded full stack developer.",
    siteName: "odevntzn",
  },
  twitter: {
    card: "summary_large_image",
    title: "odevntzn — Natan Oliveira | Full Stack Developer",
    description: "Digital products from first idea to deployment.",
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
      lang="en-GB"
      className={`${firaCode.variable} ${openSans.variable} ${unbounded.variable}`}
    >
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
