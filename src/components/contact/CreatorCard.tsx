import Image from "next/image";

import styles from "./CreatorCard.module.css";

/**
 * Card do criador no rodapé — mesma leitura do card do Lexuri: retrato
 * circular à esquerda, nome e papel à direita.
 *
 * Sem estado e sem JS: a animação é toda CSS (anel girando, brilho respirando
 * e leve elevação no hover), então continua Server Component e não pesa no
 * bundle. Nome e papel chegam por prop já resolvidos pelo rodapé, para não
 * furar a tradução do papel.
 */
export default function CreatorCard({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  return (
    <div className={styles.card} data-reveal>
      <span className={styles.avatar} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.frame}>
          <Image
            src="/Natan_pixel_art.jpeg"
            alt=""
            fill
            sizes="96px"
            className={styles.photo}
          />
        </span>
      </span>

      <span className={styles.text}>
        <strong>{name}</strong>
        <small>{role}</small>
      </span>
    </div>
  );
}
