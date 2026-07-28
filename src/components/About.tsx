import { Icon } from "@/components/ui/Icon";
import CapabilityOrbit from "@/components/about/CapabilityOrbit";
import TiltScene from "@/components/motion/TiltScene";
import WorkspaceGuide from "@/components/workspace/WorkspaceGuide";

import styles from "./About.module.css";

const principles = [
  {
    title: "Começar pelo porquê",
    description:
      "Antes de escolher tecnologia, procuro entender a pessoa, a fricção e o resultado esperado.",
  },
  {
    title: "Projetar o sistema inteiro",
    description:
      "Interface, dados, integrações e operação fazem parte da mesma experiência — por isso penso neles juntos.",
  },
  {
    title: "Colocar no mundo",
    description:
      "Uma ideia só vira produto quando funciona fora do protótipo: publicada, observável e pronta para evoluir.",
  },
] as const;

export default function About() {
  return (
    <section id="sobre" className={styles.about} aria-labelledby="about-title">
      <div className="scene-shell">
        <header className={styles.header} data-reveal>
          <div>
            <p className="chapter-kicker">
              <span className="chapter-number">02</span>
              método e mentalidade
            </p>
            <h2 id="about-title" className="section-title">
              Antes do código, eu procuro o produto.
            </h2>
          </div>
          <p className="section-lede">
            Gosto de levar ideias do zero até algo real no ar. Meu trabalho
            acontece no encontro entre engenharia, experiência e visão de
            negócio — porque um produto forte precisa das três.
          </p>
        </header>

        <div className={styles.methodGrid}>
          <TiltScene className={styles.guideStation} intensity={4.5} lift={7}>
            <span className={styles.stationLabel}>observatório / 02</span>
            <WorkspaceGuide mode="observing" variant="compact" />
            <blockquote>
              “Não quero apenas fazer a interface funcionar. Quero que cada
              decisão ajude o produto a fazer sentido.”
            </blockquote>
            <div className={styles.nextChapter}>
              <span>próximo capítulo</span>
              <strong>a ideia ganha forma</strong>
              <Icon name="arrowDown" />
            </div>
          </TiltScene>

          <ol className={styles.principles}>
            {principles.map((principle, index) => (
              <li key={principle.title} data-reveal="right">
                <span className={styles.principleNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
                <Icon name="check" />
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.capabilityHeader} data-reveal>
          <p className="chapter-kicker">o que consigo mover</p>
          <p>
            As quatro capacidades partem do mesmo centro: elas se sustentam
            entre si, e é por isso que penso nelas juntas.
          </p>
        </div>

        <CapabilityOrbit />

        <aside className={styles.learningNote} data-reveal>
          <span className={styles.learningIcon} aria-hidden="true">
            <Icon name="spark" />
          </span>
          <div>
            <span className={styles.learningLabel}>próximo ciclo</span>
            <strong>Engenharia de Computação em Portugal</strong>
          </div>
          <p>
            Continuo aprendendo, experimentando e mantendo produtos em
            produção durante essa transição.
          </p>
        </aside>
      </div>
    </section>
  );
}
