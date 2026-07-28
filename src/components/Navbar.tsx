import { navigation, profile } from "@/data/portfolio";

import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Navegação principal">
        <a className={styles.brand} href="#top" aria-label="Voltar ao início">
          <span className={styles.mark} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>{profile.displayName}</span>
        </a>

        <div className={styles.links}>
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              <span>{item.chapter}</span>
              {item.label}
            </a>
          ))}
        </div>

        <a className={styles.availability} href="#contato">
          <span className={styles.statusDot} aria-hidden="true" />
          <span className={styles.availabilityLong}>Aberto a oportunidades</span>
          <span className={styles.availabilityShort}>Contato</span>
        </a>
      </nav>
    </header>
  );
}
