"use client";

import { Icon } from "@/components/ui/Icon";
import TiltScene from "@/components/motion/TiltScene";
import LexuriShowcase from "@/components/projects/LexuriShowcase";
import ProjectPreview from "@/components/projects/ProjectPreviews";
import {
  portfolioContent,
  type PortfolioCase,
} from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./Projects.module.css";

function ProjectCard({
  project,
  code,
  technologiesLabel,
}: {
  project: PortfolioCase;
  code: string;
  technologiesLabel: string;
}) {
  return (
    <article className={styles[project.slug.replaceAll("-", "")]} data-reveal>
      <div className={styles.projectCopy}>
        <div className={styles.projectTopline}>
          <span>{code}</span>
          <span>{project.eyebrow}</span>
        </div>
        <h4>{project.name}</h4>
        <p>{project.description}</p>
        <dl>
          <div>
            <dt>{project.detailLabel}</dt>
            <dd>{project.contribution}</dd>
          </div>
        </dl>
        <ul aria-label={`${technologiesLabel} ${project.name}`}>
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <div className={styles.projectLinks}>
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              data-sound="whoosh"
            >
              {link.label}
              <Icon name="arrowUpRight" />
            </a>
          ))}
        </div>
      </div>
      <TiltScene className={styles.projectVisual} intensity={5.5} lift={5}>
        <ProjectPreview slug={project.slug} />
      </TiltScene>
    </article>
  );
}

export default function Projects() {
  const { locale } = useLanguage();
  const { deliveredWork, portfolioProjects } = portfolioContent[locale];
  const copy = locale === "pt"
    ? {
        technologies: "Tecnologias usadas em",
        kicker: "projetos, serviços e trabalhos",
        title: ["Diferentes contextos.", "Trabalho real."],
        lede:
          "Com o Lexuri destacado como produto principal, separo aqui os projetos e propostas autorais das entregas realizadas para clientes e durante minha experiência profissional.",
        projectsTitle: "Projetos e propostas",
        projectsLede:
          "Produtos autorais e conceitos interativos usados para explorar experiência, direção visual e possibilidades de negócio.",
        deliveredTitle: "Serviços e trabalhos entregues",
        deliveredLede:
          "Soluções construídas para clientes e equipes, do primeiro freelance a produtos que continuam evoluindo em parceria.",
        deliveredCode: "E",
        range: ["produto", "experiência", "engenharia"],
        rangeNote: "um processo, diferentes formas",
      }
    : {
        technologies: "Technologies used in",
        kicker: "projects, services, and work",
        title: ["Different contexts.", "Real work."],
        lede:
          "With Lexuri featured as the main product, this section separates original projects and proposals from work delivered to clients and during my professional experience.",
        projectsTitle: "Projects and proposals",
        projectsLede:
          "Original products and interactive concepts used to explore experience, visual direction, and business possibilities.",
        deliveredTitle: "Services and delivered work",
        deliveredLede:
          "Solutions built for clients and teams, from my first freelance project to products that continue to evolve through partnership.",
        deliveredCode: "D",
        range: ["product", "experience", "engineering"],
        rangeNote: "one process, different forms",
      };

  return (
    <>
      <LexuriShowcase />
      <section id="projetos" className={styles.projects} aria-labelledby="projects-title">
        <div className="scene-shell">
          <header className={styles.header} data-reveal>
            <div>
              <p className="chapter-kicker">
                <span className="chapter-number">04</span>
                {copy.kicker}
              </p>
              <h2
                id="projects-title"
                className={`section-title ${styles.projectsTitle}`}
              >
                <span>{copy.title[0]}</span>
                <strong>{copy.title[1]}</strong>
              </h2>
            </div>
            <p className="section-lede">{copy.lede}</p>
          </header>

          <section className={styles.workGroup} aria-labelledby="projects-group-title">
            <header className={styles.groupHeader} data-reveal>
              <span>04.A</span>
              <div>
                <h3 id="projects-group-title">{copy.projectsTitle}</h3>
                <p>{copy.projectsLede}</p>
              </div>
            </header>
            <div className={styles.projectGrid}>
              {portfolioProjects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  code={`P${String(index + 1).padStart(2, "0")}`}
                  technologiesLabel={copy.technologies}
                />
              ))}
            </div>
          </section>

          <section className={styles.workGroup} aria-labelledby="delivered-group-title">
            <header className={styles.groupHeader} data-reveal>
              <span>04.B</span>
              <div>
                <h3 id="delivered-group-title">{copy.deliveredTitle}</h3>
                <p>{copy.deliveredLede}</p>
              </div>
            </header>
            <div className={`${styles.projectGrid} ${styles.deliveryGrid}`}>
              {deliveredWork.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  code={`${copy.deliveredCode}${String(index + 1).padStart(2, "0")}`}
                  technologiesLabel={copy.technologies}
                />
              ))}
            </div>
          </section>

          <div className={styles.rangeNote} data-reveal>
            <span>{copy.range[0]}</span>
            <i aria-hidden="true" />
            <span>{copy.range[1]}</span>
            <i aria-hidden="true" />
            <span>{copy.range[2]}</span>
            <strong>{copy.rangeNote}</strong>
          </div>
        </div>
      </section>
    </>
  );
}
