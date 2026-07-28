import { Icon } from "@/components/ui/Icon";
import TiltScene from "@/components/motion/TiltScene";
import LexuriShowcase from "@/components/projects/LexuriShowcase";
import ProjectPreview from "@/components/projects/ProjectPreviews";
import {
  deliveredWork,
  portfolioProjects,
  type PortfolioCase,
} from "@/data/portfolio";

import styles from "./Projects.module.css";

function ProjectCard({ project, code }: { project: PortfolioCase; code: string }) {
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
        <ul aria-label={`Tecnologias usadas em ${project.name}`}>
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <div className={styles.projectLinks}>
          {project.links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
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
  return (
    <>
      <LexuriShowcase />
      <section id="projetos" className={styles.projects} aria-labelledby="projects-title">
        <div className="scene-shell">
          <header className={styles.header} data-reveal>
            <div>
              <p className="chapter-kicker">
                <span className="chapter-number">04</span>
                projetos, serviços e trabalhos
              </p>
              <h2 id="projects-title" className="section-title">
                Diferentes contextos. Trabalho real.
              </h2>
            </div>
            <p className="section-lede">
              Com o Lexuri destacado como produto principal, separo aqui os
              projetos e propostas autorais das entregas realizadas para
              clientes e durante minha experiência profissional.
            </p>
          </header>

          <section className={styles.workGroup} aria-labelledby="projects-group-title">
            <header className={styles.groupHeader} data-reveal>
              <span>04.A</span>
              <div>
                <h3 id="projects-group-title">Projetos e propostas</h3>
                <p>
                  Produtos autorais e conceitos interativos usados para explorar
                  experiência, direção visual e possibilidades de negócio.
                </p>
              </div>
            </header>
            <div className={styles.projectGrid}>
              {portfolioProjects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  code={`P${String(index + 1).padStart(2, "0")}`}
                />
              ))}
            </div>
          </section>

          <section className={styles.workGroup} aria-labelledby="delivered-group-title">
            <header className={styles.groupHeader} data-reveal>
              <span>04.B</span>
              <div>
                <h3 id="delivered-group-title">Serviços e trabalhos entregues</h3>
                <p>
                  Soluções construídas para clientes e equipes, do primeiro
                  freelance a produtos que continuam evoluindo em parceria.
                </p>
              </div>
            </header>
            <div className={`${styles.projectGrid} ${styles.deliveryGrid}`}>
              {deliveredWork.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  code={`E${String(index + 1).padStart(2, "0")}`}
                />
              ))}
            </div>
          </section>

          <div className={styles.rangeNote} data-reveal>
            <span>produto</span>
            <i aria-hidden="true" />
            <span>experiência</span>
            <i aria-hidden="true" />
            <span>engenharia</span>
            <strong>um processo, diferentes formas</strong>
          </div>
        </div>
      </section>
    </>
  );
}
