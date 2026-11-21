"use client";

import { Icon } from "@/components/ui/Icon";
import CreatorCard from "@/components/contact/CreatorCard";
import TiltScene from "@/components/motion/TiltScene";
import WorkspaceGuide from "@/components/workspace/WorkspaceGuide";
import { profile } from "@/data/portfolio";

import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <footer id="contato" className={styles.contact} aria-labelledby="contact-title">
      <div className="scene-shell">
        <div className={styles.ending}>
          <div className={styles.copy} data-reveal>
            <p className="chapter-kicker"><span className="chapter-number">05</span> END OF THE VISIT / START OF THE CONVERSATION</p>
            <h2 id="contact-title">Have an idea that deserves to become real?</h2>
            <p>I’m open to opportunities and conversations about digital products, full stack development, and experiences that deserve extra care.</p>

            <div className={styles.primaryContacts}>
              <a href={`mailto:${profile.professionalEmail}`} data-sound="check">
                <span className={styles.contactIcon}><Icon name="mail" /></span>
                <span><small>PROFESSIONAL EMAIL</small><strong>{profile.professionalEmail}</strong></span>
                <Icon name="arrowUpRight" />
              </a>
              <a href={profile.whatsappUrl} target="_blank" rel="noreferrer" data-sound="check">
                <span className={styles.contactIcon}><Icon name="whatsapp" /></span>
                <span><small>WHATSAPP</small><strong>{profile.phoneDisplay}</strong></span>
                <Icon name="arrowUpRight" />
              </a>
            </div>
          </div>

          <TiltScene className={styles.guideEnd} intensity={4} lift={8}>
            <div className={styles.drones} aria-hidden="true"><i /><i /></div>
            <span className={styles.binaryRain} aria-hidden="true">01001000 01000101 01001100 01001100 01001111<br />00110101 01010111 01000001 01001001 01010100<br />01000110 01001111 01010010 00100000 01011001<br />01001111 01010101 00101110 00101110 00101110</span>
            <span className={styles.endLabel}>NEXT STEP / CONNECT</span>
            <WorkspaceGuide mode="waving" variant="ending" />
            <p className={styles.waiting}><strong>WAITING FOR YOU</strong><span>Like what you saw?<br />Let’s build something meaningful.</span></p>
          </TiltScene>
        </div>

        <div className={styles.footerBar}>
          <CreatorCard name="odevntzn" role="Product-minded full stack developer" />
          <nav aria-label="Footer navigation">
            <a href="#top">Home</a><a href="#lexuri">Lexuri</a><a href="#projetos">Work</a><a href="#sobre">Method</a>
          </nav>
          <div className={styles.socials}>
            <a href={profile.githubUrl} target="_blank" rel="noreferrer" aria-label="Natan Oliveira on GitHub"><Icon name="github" /></a>
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" aria-label="Natan Oliveira on LinkedIn"><Icon name="linkedin" /></a>
          </div>
        </div>
        <div className={styles.legal}><span>© {new Date().getFullYear()} odevntzn</span><span>Designed and built with intention.</span></div>
      </div>
    </footer>
  );
}
