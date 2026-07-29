"use client";

import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import ScrollProgressThread from "@/components/motion/ScrollProgressThread";
import AmbientWorld from "@/components/workspace/AmbientWorld";
import { profile } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

const pageCopy = {
  pt: {
    skipLink: "Ir para o conteúdo",
    jobTitle: "Desenvolvedor Full Stack",
    knowsAbout: [
      "Desenvolvimento de produto",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Acessibilidade web",
    ],
  },
  en: {
    skipLink: "Skip to content",
    jobTitle: "Full Stack Developer",
    knowsAbout: [
      "Product development",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Web accessibility",
    ],
  },
} as const;

export default function Home() {
  const { locale } = useLanguage();
  const copy = pageCopy[locale];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    alternateName: profile.displayName,
    jobTitle: copy.jobTitle,
    email: `mailto:${profile.professionalEmail}`,
    sameAs: [profile.githubUrl, profile.linkedinUrl],
    knowsAbout: copy.knowsAbout,
  };

  return (
    <>
      <a className="skip-link" href="#conteudo">
        {copy.skipLink}
      </a>
      <AmbientWorld />
      <Navbar />
      <ScrollProgressThread />
      <main id="conteudo">
        <Hero />
        <About />
        <Projects />
      </main>
      <Contact />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
