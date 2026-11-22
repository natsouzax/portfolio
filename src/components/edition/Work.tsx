"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { profile } from "@/data/portfolio";
import LexuriPlayer from "./LexuriPlayer";
import FluxoPhone from "./FluxoPhone";
import { useLanguage } from "@/i18n/LanguageProvider";
import { editionCopy, type EditionLocale } from "@/i18n/edition";
import styles from "./Work.module.css";

const featuredWork = [
  {
    name: "Consumidor 360",
    category: "Legal guidance",
    description: "A platform that helps consumers in Brazil describe a problem and get initial guidance on their rights. It is part of the legal ecosystem I built with ADECEM.",
    href: "https://consumidor360.com.br/",
    image: "/projects/legal/consumidor360-logo.jpeg",
    alt: "",
  },
  {
    name: "Wouky",
    category: "Subscription landing page",
    description: "A landing page and waitlist for a Portuguese dog subscription box with toys, treats and chews.",
    href: "https://www.wouky.pt/",
    image: "/projects/wouky-box.webp",
    alt: "A golden retriever beside a Wouky box with treats and toys",
  },
];

export default function Work() {
  const { locale } = useLanguage();
  const copy = (editionCopy[locale as EditionLocale] ?? editionCopy.en).work;
  return (
    <>
      <section id="trabalhos-selecionados" className={styles.work} aria-labelledby="work-title">
        <div className={styles.spread}>
          <header className={styles.heading} data-assemble="">
            <h2 id="work-title" data-section-reveal="heading"><span>{copy.title}</span><br />{" "}<em>{copy.titleEm}</em></h2>
            <p data-section-reveal="copy">{copy.intro}</p>
          </header>
          <div className={styles.features}>
            <article id="lexuri">
              <div className={styles.projectTitle} data-section-reveal="copy"><h3><a href="https://lexuri.app" data-marker="">Lexuri</a></h3><small>{copy.lexuriKind}</small></div>
              <div className={styles.lexuriFrame} data-assemble="">
                <LexuriPlayer />
              </div>
              <p className={styles.lexuriCopy} data-section-reveal="copy">{copy.lexuriText}</p>
            </article>
            <article id="fluxo" className={styles.fluxo}>
              <div className={styles.fluxoTitle}>
                <div className={styles.projectTitle} data-section-reveal="copy"><h3>Fluxo</h3><small>{copy.fluxoKind}</small></div>
              </div>
              <div className={styles.fluxoFrame}>
                <FluxoPhone />
                <div className={styles.handoff} aria-hidden="true" />
              </div>
              <div className={styles.fluxoCopy}>
                <p data-section-reveal="copy">{copy.fluxoText}</p>
                <a className={styles.authorLink} data-marker="" href={profile.githubUrl}>{copy.github} <Icon name="arrowUpRight" /></a>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section id="trabalhos" className={styles.clientWork} aria-labelledby="client-work-title">
        <div className={styles.spread}>
          <header className={styles.sectionHeading}>
            <h2 id="client-work-title" data-section-reveal="heading"><span>{copy.clientTitle}</span> <em>{copy.clientTitleEm}</em></h2>
          </header>
          <div className={styles.clientGrid}>
            {featuredWork.map((item, index) => (
              <article key={item.name} className={styles.clientCard}>
                <div data-section-reveal="media">
                  <a href={item.href} className={styles.clientMedia} aria-label={`${copy.visit} ${item.name}`}>
                    <Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 90vw, 42vw" />
                    <span className={styles.open}><Icon name="arrowUpRight" /></span>
                  </a>
                </div>
                <div className={styles.projectTitle} data-section-reveal="copy">
                  <h3><a href={item.href} data-marker="">{item.name}</a></h3>
                  <small>{copy.clients[index]?.category ?? item.category}</small>
                </div>
                <p data-section-reveal="copy">{copy.clients[index]?.description ?? item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function WorkAbout() {
  const { locale } = useLanguage();
  const copy = (editionCopy[locale as EditionLocale] ?? editionCopy.en).about;
  return (
    <section id="sobre" className={styles.about} aria-labelledby="about-title">
      <div className={styles.spread}>
        <div className={styles.aboutGrid}>
          <h2 id="about-title" data-section-reveal="heading"><span>{copy.title}</span> <em>{copy.titleEm}</em></h2>
          <div>
            <p data-section-reveal="copy">{copy.lead}</p>
            <p data-section-reveal="copy">{copy.body}</p>
            <a href="#contato" data-marker="">{copy.cta} <Icon name="arrowDown" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
