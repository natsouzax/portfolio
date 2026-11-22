import { useId } from "react";
import styles from "./EntranceLogo.module.css";

export default function EntranceLogo({ exiting, waitForScroll }: { exiting?: boolean; waitForScroll?: boolean }) {
  const nameWindow = useId();

  return (
    <svg
      className={styles.logo}
      data-exiting={exiting || undefined}
      data-wait-for-scroll={waitForScroll || undefined}
      viewBox="0 0 690 188"
      width="690"
      height="188"
      role={waitForScroll ? undefined : "img"}
      aria-label={waitForScroll ? undefined : "odevntzn"}
      aria-hidden={waitForScroll || undefined}
    >
      <defs>
        <clipPath id={nameWindow}>
          <rect className={styles.window} width="525" height="68" />
        </clipPath>
      </defs>
      <g transform="translate(53 52.5)">
        <g className={styles.position}>
          <g className={styles.symbol}>
            <path className={`${styles.facet} ${styles.left}`} d="M1 81 45.5 3.5 50.5 35Z" />
            <path className={`${styles.facet} ${styles.right}`} d="M50 0 95 79.5 63.5 61Z" />
            <path className={`${styles.facet} ${styles.base}`} d="M4.5 83 32.5 62 91 83Z" />
          </g>
        </g>
      </g>
      <g transform="translate(168 63.5) scale(.91)" clipPath={`url(#${nameWindow})`}>
        <g className={styles.letters} fillRule="evenodd">
          <path d="M9 23H49L58 32V55L49 64H9L0 55V32ZM13 34 11 36V51L13 53H45L47 51V36L45 34Z" />
          <path transform="translate(68)" d="M9 23H47V4H58V64H9L0 55V32ZM13 34 11 36V51L13 53H47V34Z" />
          <path transform="translate(136)" d="M9 23H49L58 32V48H11V51L13 54H58V64H9L0 55V32ZM13 33 11 35V39H47V35L45 33Z" />
          <path transform="translate(202)" d="M0 23H13L29 51 45 23H58L34 64H24Z" />
          <path transform="translate(269)" d="M0 23H46L56 33V64H45V37L42 34H11V64H0Z" />
          <path transform="translate(335)" d="M4 10H15V23H46V34H15V48L20 53H46V64H15L4 53Z" />
          <path transform="translate(392)" d="M1 23H54V33L19 53H54V64H0V54L35 34H1Z" />
          <path transform="translate(456)" d="M0 23H46L56 33V64H45V37L42 34H11V64H0Z" />
        </g>
      </g>
    </svg>
  );
}
