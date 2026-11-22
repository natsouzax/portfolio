import Entrance from "@/components/edition/Entrance";
import Opening from "@/components/edition/Opening";
import Fragments from "@/components/edition/Fragments";
import Work, { WorkAbout } from "@/components/edition/Work";
import PersonalProjects from "@/components/edition/PersonalProjects";
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
      <main id="conteudo">
        <Opening />
        <Fragments />
        <WorkAbout />
        <Work />
        <PersonalProjects githubUrl={profile.githubUrl} />
      </main>
      <Closing />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </Entrance>
  );
}
