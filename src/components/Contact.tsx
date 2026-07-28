import { Icon } from "@/components/ui/Icon";
import TiltScene from "@/components/motion/TiltScene";
import WorkspaceGuide from "@/components/workspace/WorkspaceGuide";
import { navigation, profile } from "@/data/portfolio";

import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <footer id="contato" className={styles.contact} aria-labelledby="contact-title">
      <div className="scene-shell">
        <div className={styles.ending}>
          <div className={styles.copy} data-reveal>
            <p className="chapter-kicker">
              <span className="chapter-number">05</span>
              fim da visita / início da conversa
            </p>
            <h2 id="contact-title">
              Tem uma ideia que merece sair do rascunho?
            </h2>
            <p>
              Estou aberto a oportunidades e conversas sobre produtos digitais,
              desenvolvimento full stack e experiências que pedem mais cuidado.
            </p>

            <div className={styles.primaryContacts}>
              <a href={`mailto:${profile.professionalEmail}`}>
                <span className={styles.contactIcon}>
                  <Icon name="mail" />
                </span>
                <span>
                  <small>e-mail profissional</small>
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
            <span className={styles.endLabel}>session.end / obrigado pela visita</span>
            <WorkspaceGuide mode="waving" variant="ending" />
            <p>
              O workspace continua evoluindo.
              <br />
              Volte quando quiser.
            </p>
          </TiltScene>
        </div>

        <div className={styles.footerBar}>
          <div className={styles.identity}>
            <span className={styles.footerMark} aria-hidden="true">NO</span>
            <span>
              <strong>{profile.fullName}</strong>
              <small>{profile.role}</small>
            </span>
          </div>

          <nav aria-label="Navegação do rodapé">
            <a href="#top">Início</a>
            {navigation.slice(0, -1).map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </nav>

          <div className={styles.socials}>
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub de Natan Oliveira"
            >
              <Icon name="github" />
            </a>
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn de Natan Oliveira"
            >
              <Icon name="linkedin" />
            </a>
          </div>
        </div>

        <div className={styles.legal}>
          <span>© {new Date().getFullYear()} {profile.displayName}</span>
          <span>Projetado e construído com intenção.</span>
        </div>
      </div>
    </footer>
  );
}
