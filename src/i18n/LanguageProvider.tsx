"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Locale = "pt" | "en";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const STORAGE_KEY = "natan-portfolio-locale";
const localeListeners = new Set<() => void>();
let fallbackLocale: Locale = "pt";

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "pt";

  try {
    const storedLocale = window.localStorage.getItem(STORAGE_KEY);
    return storedLocale === "en" || storedLocale === "pt"
      ? storedLocale
      : fallbackLocale;
  } catch {
    return fallbackLocale;
  }
}

function subscribeToLocale(onStoreChange: () => void) {
  localeListeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    localeListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function storeLocale(locale: Locale) {
  fallbackLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // The language still changes for the current session when storage is blocked.
  }
  localeListeners.forEach((listener) => listener());
}

function getServerLocale(): Locale {
  return "pt";
}

const documentCopy: Record<
  Locale,
  {
    lang: string;
    openGraphLocale: string;
    title: string;
    description: string;
    applicationName: string;
    keywords: string;
    openGraphTitle: string;
    openGraphDescription: string;
    twitterDescription: string;
    imageAlt: string;
  }
> = {
  pt: {
    lang: "pt-BR",
    openGraphLocale: "pt_BR",
    title: "Natan Oliveira — Desenvolvedor Full Stack",
    description:
      "Portfólio de Natan de Souza Oliveira, desenvolvedor full stack orientado a produto. Experiências digitais do planejamento ao deploy.",
    applicationName: "Workspace de Natan Oliveira",
    keywords:
      "Natan Oliveira, desenvolvedor full stack, desenvolvimento de produto, Next.js, TypeScript, React",
    openGraphTitle: "Natan Oliveira — Produtos digitais, pensados por inteiro",
    openGraphDescription:
      "Entre no workspace de um desenvolvedor full stack que conecta produto, experiência e engenharia.",
    twitterDescription: "Produtos digitais do primeiro diagrama ao deploy.",
    imageAlt: "Natan Oliveira — Produtos digitais, pensados por inteiro",
  },
  en: {
    lang: "en-GB",
    openGraphLocale: "en_GB",
    title: "Natan Oliveira — Full Stack Developer",
    description:
      "Portfolio of Natan de Souza Oliveira, a product-minded full stack developer. Digital experiences from planning to deployment.",
    applicationName: "Natan Oliveira's Workspace",
    keywords:
      "Natan Oliveira, full stack developer, product development, Next.js, TypeScript, React",
    openGraphTitle: "Natan Oliveira — Digital products, thought through end to end",
    openGraphDescription:
      "Step into the workspace of a full stack developer who connects product, experience, and engineering.",
    twitterDescription: "Digital products from the first diagram to deployment.",
    imageAlt: "Natan Oliveira — Digital products, thought through end to end",
  },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getStoredLocale,
    getServerLocale,
  );

  useEffect(() => {
    const currentDocument = documentCopy[locale];
    document.documentElement.lang = currentDocument.lang;
    document.documentElement.dataset.locale = locale;
    document.title = currentDocument.title;
    const metadata = [
      ['meta[name="description"]', currentDocument.description],
      ['meta[name="application-name"]', currentDocument.applicationName],
      ['meta[name="keywords"]', currentDocument.keywords],
      ['meta[property="og:title"]', currentDocument.openGraphTitle],
      ['meta[property="og:description"]', currentDocument.openGraphDescription],
      ['meta[property="og:locale"]', currentDocument.openGraphLocale],
      ['meta[property="og:image:alt"]', currentDocument.imageAlt],
      ['meta[name="twitter:title"]', currentDocument.title],
      ['meta[name="twitter:description"]', currentDocument.twitterDescription],
      ['meta[name="twitter:image:alt"]', currentDocument.imageAlt],
    ] as const;

    metadata.forEach(([selector, content]) => {
      document.querySelector(selector)?.setAttribute("content", content);
    });
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: storeLocale,
      toggleLocale: () => storeLocale(locale === "pt" ? "en" : "pt"),
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
