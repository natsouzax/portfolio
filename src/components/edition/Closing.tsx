import { profile } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import Crowd from "./Crowd";
import styles from "./Closing.module.css";

export default function Closing() {
  return (
    <footer id="contato" className={styles.closing} aria-labelledby="closing-title">
      <div className={styles.invitation}>
        <div className={styles.copy}>
          <p className={styles.status}><i aria-hidden="true"/> Open for collaborations</p>
          <h2 id="closing-title">Waiting<br/><em>for you.</em></h2>
        </div>
        <a className={styles.email} data-marker="" href={`mailto:${profile.professionalEmail}`} data-sound="check">
          Send me an email <Icon name="arrowUpRight" />
        </a>
      </div>
      <Crowd />
      <div className={styles.bottom}>
        <span>{profile.displayName} <span className={styles.slash}>/</span> Portugal</span>
        <nav aria-label="Contact and social links">
          <a href={profile.whatsappUrl} data-marker="" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={profile.githubUrl} data-marker="" target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.linkedinUrl} data-marker="" target="_blank" rel="noreferrer">LinkedIn</a>
        </nav>
        <a href="#top" className={styles.back} data-marker="">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
