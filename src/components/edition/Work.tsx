import { Icon } from "@/components/ui/Icon";
import { portfolioContent } from "@/data/portfolio";
import styles from "./Work.module.css";

// Editorial artwork for the listening and review loop in Lexuri.
function Tape() {
  return (
    <div className={styles.tapeScene} aria-hidden="true">
      <div className={styles.tape}>
        <i className={styles.screws} />
        <div className={styles.tapeLabel}>
          <span>LEXURI AUDIO LIBRARY</span>
          <strong>Lexuri.</strong>
          <small>ENGLISH IN CONTEXT</small>
        </div>
        <div className={styles.tapeWindow}>
          <i /><b /><i />
        </div>
        <div className={styles.tapeBase}><i /><i /></div>
      </div>
    </div>
  );
}

function Ledger() {
  return (
    <div className={styles.ledgerScene} aria-hidden="true">
      <div className={styles.paper}>
        <b>Fluxo</b><small>MONTHLY OVERVIEW</small>
        <div className={styles.rule} />
        <span>Budget summary</span>
        <div className={styles.bars}>
          {[38, 56, 43, 70, 59, 92, 80].map((height, i) => (
            <i key={i} style={{ height: height + "%" }} />
          ))}
        </div>
        <div className={styles.rule} />
        <small>ACCOUNTS · GOALS · NOTES</small>
        <div className={styles.barcode} />
      </div>
    </div>
  );
}

const { portfolioProjects, deliveredWork } = portfolioContent.en;
const archive = [portfolioProjects[1], ...deliveredWork];

export default function Work() {
  return (
    <>
      <section id="projetos" className={styles.work} aria-labelledby="work-title">
        <div className={styles.spread}>
          <header className={styles.heading} data-assemble="">
            <h2 id="work-title">Selected<br /><em>work.</em></h2>
            <p>Independent products and commissioned work, from the first sketch to software people can use.</p>
          </header>
          <div className={styles.features}>
            <article id="lexuri" className={styles.lead} data-assemble="">
              <a className={styles.artLink} href="https://lexuri.app" aria-label="Visit Lexuri">
                <Tape /><span className={styles.open}><Icon name="arrowUpRight" /></span>
              </a>
              <div className={styles.projectTitle}><h3><a href="https://lexuri.app" data-marker="">Lexuri</a></h3><small>Language learning</small></div>
              <p>Pause on a phrase, hear how it sounds, then come back to it. I designed and built a way to study English through the videos you already watch.</p>
            </article>
            <article className={styles.second} data-assemble="">
              <Ledger />
              <div className={styles.projectTitle}><h3>Fluxo</h3><small>Mobile product</small></div>
              <p>A personal finance app that brings accounts, goals and notes together. I shaped the product and built its mobile experience in React Native.</p>
              <a className={styles.authorLink} data-marker="" href={portfolioProjects[0].links[0].href}>My GitHub profile <Icon name="arrowUpRight" /></a>
            </article>
          </div>
          <section className={styles.archive} data-assemble="" aria-labelledby="archive-title">
            <h3 id="archive-title">More projects</h3>
            <div className={styles.rows}>
              {archive.map((item) => (
                <details key={item.slug} className={styles.row}>
                  <summary>
                    <strong data-marker="">{item.name}</strong>
                    <small>{item.technologies[0]}</small>
                    <span aria-hidden="true" className={styles.toggle} />
                  </summary>
                  <div className={styles.details}>
                    <p>{item.description}</p>
                    <div>{item.links.map((link) => (
                      <a key={link.href} href={link.href} data-marker="">{link.label}<Icon name="arrowUpRight" /></a>
                    ))}</div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </section>
      <section id="sobre" className={styles.about} aria-labelledby="about-title">
        <div className={styles.spread}>
          <div className={styles.aboutGrid}>
            <h2 id="about-title">About <em>me.</em></h2>
            <div>
              <p>I’m Natan Oliveira. I design and build digital products in Portugal while studying Computer Engineering.</p>
              <p>On Lexuri, that means asking what happens when a learner pauses a video for one unfamiliar expression. The answer shapes the interface, the data I save and what comes back in their next review.</p>
              <a href="#contato" data-marker="">Get in touch <Icon name="arrowDown" /></a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
