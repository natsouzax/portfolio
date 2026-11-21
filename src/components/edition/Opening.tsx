import Portrait from "./Portrait";
import Masthead from "./Masthead";
import styles from "./Edition.module.css";

export default function Opening() {
  return (
    <section id="top" className={styles.opening} aria-labelledby="identity-name">
      <div className={styles.viewport}>
        <Masthead />
        <div className={styles.theatre}>
          <div className={styles.field} aria-hidden="true"><i/><i/><i/></div>
          <h1 id="identity-name" className={styles.name}><span>Natan</span>{" "}<span>Souza</span></h1>
          <div className={styles.subject}><Portrait /></div>
          <span className={styles.caption}>Biometric portrait</span>
        </div>
        <div className={styles.lower}>
          <p>Full stack developer<br/><span>based in Portugal.</span></p>
          <a href="#projetos" data-sound="whoosh">Selected work <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
  );
}

