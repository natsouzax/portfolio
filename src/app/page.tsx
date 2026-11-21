import Entrance from "@/components/edition/Entrance";
import Opening from "@/components/edition/Opening";
import Work from "@/components/edition/Work";
import Closing from "@/components/edition/Closing";
import { profile } from "@/data/portfolio";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    alternateName: "odevntzn",
    jobTitle: "Full Stack Developer",
    email: `mailto:${profile.professionalEmail}`,
    sameAs: [profile.githubUrl, profile.linkedinUrl],
    knowsAbout: ["Product development", "TypeScript", "React", "Next.js", "Node.js", "Web accessibility"],
  };

  return (
    <Entrance>
      <a className="skip-link" href="#conteudo">Skip to content</a>
      <main id="conteudo">
        <Opening />
        <Work />
      </main>
      <Closing />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </Entrance>
  );
}
