import Image from "next/image";

import styles from "./CreatorAvatar.module.css";

/**
 * Retrato circular do criador para o rodapé — mesma leitura do card do Lexuri.
 *
 * Sem estado e sem JS: a vida vem de dois keyframes CSS (anel girando e brilho
 * respirando), então o componente continua sendo Server Component e não pesa
 * no bundle. O nome e o papel já são renderizados pelo bloco de identidade do
 * rodapé, por isso aqui não há texto — nada novo para traduzir.
 */
export default function CreatorAvatar() {
  return (
    <span className={styles.avatar} aria-hidden="true">
      <span className={styles.ring} />
      <span className={styles.frame}>
        <Image
          src="/characters/identity-sprites-v3/portrait-real.webp"
          alt=""
          fill
          sizes="72px"
          className={styles.photo}
        />
      </span>
    </span>
  );
}
