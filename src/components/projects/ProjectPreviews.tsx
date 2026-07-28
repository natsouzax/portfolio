"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import type { PortfolioCase } from "@/data/portfolio";

import styles from "../Projects.module.css";

function FluxoPreview() {
  return (
    <div className={styles.fluxoPreview} aria-hidden="true">
      <span className={styles.financeOrb} />
      <div className={styles.phoneFrame}>
        <div className={styles.phoneStatus}>
          <strong>fluxo</strong>
          <span>9:41</span>
        </div>
        <p>Olá, Natan</p>
        <small>seu dinheiro, com contexto</small>
        <div className={styles.balanceCard}>
          <span>saldo total</span>
          <strong>R$ ••••</strong>
          <i>4 contas conectadas</i>
        </div>
        <div className={styles.financeRows}>
          <span><i />Cartão principal<strong>- R$ 184</strong></span>
          <span><i />Meta da viagem<strong>68%</strong></span>
          <span><i />Próximo compromisso<strong>18:30</strong></span>
        </div>
      </div>
      <div className={styles.aiPrompt}>
        <span>fluxo.ai</span>
        <p>“O que mudou no meu orçamento esta semana?”</p>
      </div>
    </div>
  );
}

type StoreView = "visao" | "catalogo" | "inteligencia";

const storeViews: Array<{ id: StoreView; label: string }> = [
  { id: "visao", label: "Projeto" },
  { id: "catalogo", label: "Catálogo" },
  { id: "inteligencia", label: "LS Vision" },
];

function StoreViewContent({ view }: { view: StoreView }) {
  if (view === "catalogo") {
    return (
      <motion.div
        key={view}
        className={styles.storeCatalogScreen}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -14 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.storeCatalogIntro}>
          <span>CATÁLOGO INTELIGENTE</span>
          <strong>Explore, filtre, encontre.</strong>
          <div><i>Todos</i><i>Camisas</i><i>Acessórios</i></div>
        </div>
        <div className={styles.storeProducts}>
          {[
            ["Oxford", "R$ 189"],
            ["Urban", "R$ 349"],
            ["Flow", "R$ 279"],
          ].map(([name, price], index) => (
            <div key={name}>
              <span className={styles[`storeProduct${index + 1}`]} />
              <small>LS STORE</small>
              <strong>{name}</strong>
              <i>{price}</i>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (view === "inteligencia") {
    return (
      <motion.div
        key={view}
        className={styles.storeVisionScreen}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -14 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.storeVisionTitle}>
          <span>LS VISION</span>
          <strong>Dados para decidir melhor.</strong>
        </div>
        <div className={styles.storeMetrics}>
          <div><small>conversão</small><strong>4,7%</strong><i>+0,8%</i></div>
          <div><small>ticket médio</small><strong>R$ 286</strong><i>+12%</i></div>
          <div><small>pedidos</small><strong>847</strong><i>esta semana</i></div>
        </div>
        <div className={styles.storeChart}>
          {[38, 58, 45, 72, 62, 86, 76, 94].map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={view}
      className={styles.storeHeroScreen}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <span>PLATAFORMA DIGITAL</span>
      <strong>
        O futuro da <i>LS Store</i> começa aqui.
      </strong>
      <p>Uma visão de produto criada para transformar intenção em direção.</p>
      <b>Conhecer projeto ↓</b>
    </motion.div>
  );
}

function StorePreview() {
  const [view, setView] = useState<StoreView>("visao");

  return (
    <div className={styles.storePreview} aria-label="Prévia interativa da proposta LS Store">
      <div className={styles.storeWindow}>
        <header className={styles.storeHeader}>
          <strong>LS Store</strong>
          <nav aria-label="Explorar proposta LS Store">
            {storeViews.map((item) => (
              <button
                key={item.id}
                type="button"
                className={view === item.id ? styles.storeTabActive : undefined}
                onClick={() => setView(item.id)}
                aria-pressed={view === item.id}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <span>proposta / v1</span>
        </header>
        <div className={styles.storeViewport}>
          <AnimatePresence mode="wait" initial={false}>
            <StoreViewContent view={view} />
          </AnimatePresence>
        </div>
        <footer className={styles.storeFooter}>
          <span>entender</span><i />
          <span>desenhar</span><i />
          <span>alinhar</span>
          <strong>clique nas abas</strong>
        </footer>
      </div>
    </div>
  );
}

function LegalEcosystemPreview() {
  return (
    <div className={styles.servicesPreview} aria-label="Prévia unificada do ecossistema jurídico">
      <div className={styles.legalBrowser}>
        <div className={`${styles.browserBar} ${styles.legalBrowserBar}`}>
          <span /><span /><span />
          <small>adecem.org</small>
          <i>mesmo ecossistema</i>
          <small>consumidor360.com.br</small>
        </div>
        <div className={styles.legalSplitScreen}>
          <section className={styles.legalAdecemPane}>
            <div className={styles.legalPaneBrand}>
              <Image src="/projects/legal/adecem-icon.png" width={44} height={44} alt="" />
              <strong>ADECEM</strong>
            </div>
            <span>ASSOCIAÇÃO CIVIL DIGITAL</span>
            <h5>Defesa do consumidor com força coletiva.</h5>
            <p>Relatos, documentos e demandas em uma jornada clara e responsável.</p>
            <div className={styles.legalAdecemPhoto}>
              <Image
                src="/projects/legal/adecem-consultation.jpg"
                alt="Atendimento usado na apresentação da ADECEM"
                fill
                sizes="(max-width: 780px) 46vw, 25vw"
              />
              <b>Relate seu caso →</b>
            </div>
          </section>

          <span className={styles.legalBridge} aria-hidden="true">
            <strong>+</strong>
            <small>mesmo<br />cliente</small>
          </span>

          <section className={styles.legalConsumerPane}>
            <Image
              src="/projects/legal/consumidor360-logo.jpeg"
              width={190}
              height={92}
              alt="Consumidor 360"
            />
            <span>ORIENTAÇÃO INICIAL PARA CONSUMIDOR</span>
            <h5>Resolva sua dúvida com <i>clareza e segurança.</i></h5>
            <p>Um fluxo guiado, humano e direto para encontrar o próximo passo.</p>
            <b>Iniciar orientação gratuita →</b>
            <ul><li>2 minutos</li><li>Linguagem humana</li><li>Privacidade</li></ul>
          </section>
        </div>
      </div>
      <span className={styles.serviceLabel}>duas frentes / uma evolução contínua</span>
    </div>
  );
}

function TotalSuplementsPreview() {
  return (
    <div className={styles.totalPreview} aria-label="Prévia do e-commerce Total Suplements">
      <span className={styles.totalPlatform}>WordPress + WooCommerce</span>
      <div className={styles.totalWindow}>
        <div className={styles.totalRealHeader}>
          <Image src="/projects/total-suplements/logo.png" width={42} height={42} alt="" />
          <div><span>Pesquisar suplementos...</span><b>⌕</b></div>
          <i>♙</i><i>☰</i><i>●</i>
        </div>
        <div className={styles.totalRealHero}>
          <div>
            <small>SUPLEMENTAÇÃO PREMIUM</small>
            <strong>Total Suplements</strong>
            <p>Produtos para recuperação, performance e uma rotina mais forte.</p>
            <b>Comprar agora →</b>
          </div>
          <div className={styles.totalHeroPhoto}>
            <Image
              src="/projects/total-suplements/hero-products.jpg"
              alt="Produtos exibidos no e-commerce Total Suplements"
              fill
              sizes="(max-width: 780px) 90vw, 42vw"
            />
          </div>
        </div>
        <div className={styles.totalCategories}>
          <span>Recuperação</span><span>Performance</span><span>Bem-estar</span>
        </div>
      </div>
      <div className={styles.validationBadge}>
        <span>MVP</span>
        <strong>validação com cliente real</strong>
      </div>
    </div>
  );
}

function AutomationBotPreview() {
  const nodes = ["gerar", "classificar", "validar", "agendar"];

  return (
    <div className={styles.botPreview} aria-hidden="true">
      <div className={styles.botHeader}>
        <span>Bitjuris / estágio</span>
        <strong>content.pipeline()</strong>
        <i>safe mode</i>
      </div>
      <div className={styles.pipeline}>
        {nodes.map((node, index) => (
          <div key={node} className={styles.pipelineNode}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{node}</strong>
          </div>
        ))}
      </div>
      <div className={styles.postPreview}>
        <span>𝕏 / conteúdo institucional</span>
        <p>Informação útil, revisada e pronta para o momento certo.</p>
        <i>scheduled</i>
      </div>
    </div>
  );
}

export default function ProjectPreview({ slug }: { slug: PortfolioCase["slug"] }) {
  switch (slug) {
    case "fluxo":
      return <FluxoPreview />;
    case "ls-store":
      return <StorePreview />;
    case "legal-ecosystem":
      return <LegalEcosystemPreview />;
    case "total-suplements":
      return <TotalSuplementsPreview />;
    case "x-content-bot":
      return <AutomationBotPreview />;
  }
}
