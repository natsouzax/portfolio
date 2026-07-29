"use client";

import { Icon } from "@/components/ui/Icon";
import CreatorCard from "@/components/contact/CreatorCard";
import TiltScene from "@/components/motion/TiltScene";
import WorkspaceGuide from "@/components/workspace/WorkspaceGuide";
import { portfolioContent, profile } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./Contact.module.css";

export default function Contact() {
  const { locale } = useLanguage();
  const { navigation, role } = portfolioContent[locale];
  const copy = locale === "pt"
    ? {
        kicker: "fim da visita / início da conversa",
        title: "Tem uma ideia que merece sair do rascunho?",
        lede:
          "Estou aberto a oportunidades e conversas sobre produtos digitais, desenvolvimento full stack e experiências que pedem mais cuidado.",
        email: "e-mail profissional",
        nextStep: "próximo passo / vamos conversar",
        likedIt: "Gostou do que viu?",
        invitation: "Vamos tirar sua ideia do papel.",
        footerNavigation: "Navegação do rodapé",
        home: "Início",
        github: "GitHub de Natan Oliveira",
        linkedin: "LinkedIn de Natan Oliveira",
        legal: "Projetado e construído com intenção.",
      }
    : {
        kicker: "end of the visit / start of the conversation",
        title: "Have an idea that deserves to leave the drawing board?",
        lede:
          "I'm open to opportunities and conversations about digital products, full stack development, and experiences that deserve extra care.",
        email: "professional email",
        nextStep: "next step / let's talk",
        likedIt: "Like what you saw?",
        invitation: "Let's bring your idea to life.",
        footerNavigation: "Footer navigation",
        home: "Home",
        github: "Natan Oliveira on GitHub",
        linkedin: "Natan Oliveira on LinkedIn",
        legal: "Designed and built with intention.",
      };

  return (
    <footer id="contato" className={styles.contact} aria-labelledby="contact-title">
      <div className="scene-shell">
        <div className={styles.ending}>
          <div className={styles.copy} data-reveal>
            <p className="chapter-kicker">
              <span className="chapter-number">05</span>
              {copy.kicker}
            </p>
            <h2 id="contact-title">
              {copy.title}
            </h2>
            <p>{copy.lede}</p>

            <div className={styles.primaryContacts}>
              <a href={`mailto:${profile.professionalEmail}`}>
                <span className={styles.contactIcon}>
                  <Icon name="mail" />
                </span>
                <span>
                  <small>{copy.email}</small>
                  <strong>{profile.professionalEmail}</strong>
                </span>
                <Icon name="arrowUpRight" />
              </a>
              <a href={profile.whatsappUrl} target="_blank" rel="noreferrer">
                <span className={styles.contactIcon}>
                  <Icon name="whatsapp" />
                </span>
                <span>
                  <small>WhatsApp</small>
                  <strong>{profile.phoneDisplay}</strong>
                </span>
                <Icon name="arrowUpRight" />
              </a>
            </div>
          </div>

          <TiltScene className={styles.guideEnd} intensity={4} lift={8}>
            <span className={styles.endLabel}>{copy.nextStep}</span>
            <WorkspaceGuide mode="waving" variant="ending" />
            <p>
              {copy.likedIt}
              <br />
              {copy.invitation}
            </p>
          </TiltScene>
        </div>

        <div className={styles.footerBar}>
          <CreatorCard name={profile.fullName} role={role} />

          <nav aria-label={copy.footerNavigation}>
            <a href="#top">{copy.home}</a>
            {navigation.slice(0, -1).map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </nav>

          <div className={styles.socials}>
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={copy.github}
            >
              <Icon name="github" />
            </a>
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={copy.linkedin}
            >
              <Icon name="linkedin" />
            </a>
          </div>
        </div>

        <div className={styles.legal}>
          <span>© {new Date().getFullYear()} {profile.displayName}</span>
          <span>{copy.legal}</span>
        </div>
      </div>
    </footer>
  );
}
