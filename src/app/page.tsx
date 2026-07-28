import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import ScrollProgressThread from "@/components/motion/ScrollProgressThread";
import AmbientWorld from "@/components/workspace/AmbientWorld";
import { profile } from "@/data/portfolio";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    alternateName: profile.displayName,
    jobTitle: "Desenvolvedor Full Stack",
    email: `mailto:${profile.professionalEmail}`,
    sameAs: [profile.githubUrl, profile.linkedinUrl],
    knowsAbout: [
      "Desenvolvimento de produto",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Acessibilidade web",
    ],
  };

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
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
