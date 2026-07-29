"use client";

import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./IdentitySprite.module.css";

export type IdentityMode = "arriving" | "observing" | "presenting" | "waving";

type IdentityFrame = {
  primary: string;
  holograms?: string[];
  code: string;
};

const frames: Record<IdentityMode, IdentityFrame> = {
  arriving: {
    primary: "/characters/identity-sprites-v3/portrait-real.webp",
    holograms: [
      "/characters/identity-sprites-v3/portrait-mesh-three-quarter.webp",
      "/characters/identity-sprites-v3/portrait-mesh-back.webp",
      "/characters/identity-sprites-v3/portrait-mesh-profile.webp",
      "/characters/identity-sprites-v3/portrait-half-scan.webp",
    ],
    code: "ID.01",
  },
  observing: {
    primary: "/characters/identity-sprites-v1/portrait-front.webp",
    holograms: ["/characters/identity-sprites-v1/portrait-mesh-three-quarter.webp"],
    code: "ID.02",
  },
  presenting: {
    primary: "/characters/identity-sprites-v1/fullbody-profile.webp",
    holograms: ["/characters/identity-sprites-v1/portrait-mesh-profile.webp"],
    code: "ID.03",
  },
  waving: {
    primary: "/characters/identity-sprites-v1/fullbody-wave.webp",
    code: "ID.04",
  },
};

const frameCopy = {
  pt: {
    arriving: {
      alt: "Retrato 3D de Natan Oliveira chegando ao workspace",
      axis: "entrada / 032°",
    },
    observing: {
      alt: "Retrato 3D de Natan Oliveira observando o sistema",
      axis: "scan / identidade",
    },
    presenting: {
      alt: "Renderização 3D de Natan Oliveira apresentando uma ideia",
      axis: "produto / perfil",
    },
    waving: {
      alt: "Renderização 3D de Natan Oliveira acenando",
      axis: "saída / online",
    },
  },
  en: {
    arriving: {
      alt: "3D portrait of Natan Oliveira arriving at the workspace",
      axis: "entry / 032°",
    },
    observing: {
      alt: "3D portrait of Natan Oliveira observing the system",
      axis: "scan / identity",
    },
    presenting: {
      alt: "3D rendering of Natan Oliveira presenting an idea",
      axis: "product / profile",
    },
    waving: {
      alt: "3D rendering of Natan Oliveira waving",
      axis: "exit / online",
    },
  },
} as const;

export default function IdentitySprite({
  mode,
  preload = false,
  sizes,
}: {
  mode: IdentityMode;
  preload?: boolean;
  sizes: string;
}) {
  const { locale } = useLanguage();
  const frame = frames[mode];
  const copy = frameCopy[locale][mode];

  return (
    <div className={`${styles.sprite} ${styles[mode]}`} data-identity-frame={frame.code}>
      <span className={styles.depthPlaneBack} aria-hidden="true" />
      <span className={styles.depthPlaneMiddle} aria-hidden="true" />

      <span className={styles.primaryLayer}>
        <Image
          src={frame.primary}
          alt={copy.alt}
          fill
          preload={preload}
          sizes={sizes}
          unoptimized
          className={styles.spriteImage}
        />
      </span>

      {frame.holograms?.map((hologram, index) => (
        <span
          key={hologram}
          className={`${styles.hologramLayer} ${styles[`hologram${index + 1}`]}`}
          aria-hidden="true"
        >
          <Image
            src={hologram}
            alt=""
            fill
            sizes={sizes}
            unoptimized
            className={styles.spriteImage}
          />
        </span>
      ))}

      <span className={styles.scanBeam} aria-hidden="true" />
      <span className={styles.crtNoise} aria-hidden="true" />
      <span className={styles.crtGlitch} aria-hidden="true" />
      <span className={styles.depthGrid} aria-hidden="true" />
      <span className={styles.dataRail} aria-hidden="true">
        <strong>{frame.code}</strong>
        <i />
        <small>{copy.axis}</small>
      </span>
    </div>
  );
}
