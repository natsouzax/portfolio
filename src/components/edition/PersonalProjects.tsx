"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { personalProjects } from "@/data/personal-projects";
import styles from "./Work.module.css";

const projectCount = personalProjects.length;

export default function PersonalProjects({ githubUrl }: { githubUrl: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const project = personalProjects[activeIndex];

  function advance(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + projectCount) % projectCount);
  }

  function handleControlKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    advance(event.key === "ArrowLeft" ? -1 : 1);
  }

  return (
    <section id="projetos" className={styles.personalProjects} aria-labelledby="personal-projects-title">
      <div className={styles.spread}>
        <header className={`${styles.sectionHeading} ${styles.explorerHeading}`}>
          <h2 id="personal-projects-title" data-section-reveal="heading"><span>Personal</span> <em>projects.</em></h2>
          <div className={styles.projectControls} role="group" aria-label="Browse personal projects">
            <button type="button" aria-label="Previous project" aria-controls="active-project" onClick={() => advance(-1)} onKeyDown={handleControlKey}>
              <Icon name="arrowDown" />
            </button>
            <span className={styles.projectPosition} role="status" aria-atomic="true">
              <span className={styles.projectAnnouncement}>{project.name}, </span>
              {activeIndex + 1} <span aria-hidden="true">/</span><span className={styles.projectAnnouncement}> of </span> {projectCount}
            </span>
            <button type="button" aria-label="Next project" aria-controls="active-project" onClick={() => advance(1)} onKeyDown={handleControlKey}>
              <Icon name="arrowDown" />
            </button>
          </div>
        </header>
        <article id="active-project" className={styles.projectPanel} aria-labelledby="active-project-title">
          <div className={styles.projectInfo} data-section-reveal="copy">
            <span className={styles.projectCategory}>{project.category}</span>
            <h3 id="active-project-title">{project.name}</h3>
            <p>{project.description}</p>
            <ul className={styles.projectTech} aria-label="Technologies and platform">
              {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
            </ul>
            <div className={styles.projectLinks}>
              {project.demo ? <a href={project.demo.href} data-marker="">{project.demo.label} <Icon name="arrowUpRight" /></a> : null}
              <a href={`${githubUrl}/${project.repository}`} data-marker="">View repository <Icon name="arrowUpRight" /></a>
            </div>
          </div>
          {"src" in project.artwork ? (
            <div className={styles.projectImage}>
              <Image key={project.artwork.src} src={project.artwork.src} alt={project.artwork.alt} fill sizes="(max-width: 700px) 90vw, 53vw" />
            </div>
          ) : (
            <ol className={styles.projectSteps}>
              {project.artwork.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          )}
        </article>
      </div>
    </section>
  );
}
