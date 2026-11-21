import Image from "next/image";
import { profile } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import styles from "./Closing.module.css";

export default function Closing() {
  return (
    <footer id="contato" className={styles.closing} aria-labelledby="closing-title">
      <div className={styles.invitation}>
        <div className={styles.copy}>
          <p className={styles.status}><i aria-hidden="true"/> Open for collaborations</p>
          <h2 id="closing-title">Waiting<br/><em>for you.</em></h2>
          <a className={styles.email} href={`mailto:${profile.professionalEmail}`} data-sound="check">
            Send me an email <Icon name="arrowUpRight" />
          </a>
        </div>
        <div className={styles.theatre}>
          <Image
            src="/edition/closing/transmission.svg"
            alt="A faceted hologram of Natan waves beside two hovering robots."
            width={480} height={380} className={styles.sculpture} unoptimized
          />
        </div>
      </div>
      <div className={styles.bottom}>
        <span>{profile.displayName} <span className={styles.slash}>/</span> Portugal</span>
        <nav aria-label="Contact and social links">
          <a href={profile.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
        </nav>
        <a href="#top" className={styles.back}>Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
