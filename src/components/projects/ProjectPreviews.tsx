"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import type { PortfolioCase } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "../Projects.module.css";

const previewCopy = {
  pt: {
    fluxo: {
      hello: "Olá, Natan",
      tagline: "seu dinheiro, com contexto",
      balance: "saldo total",
      accounts: "4 contas conectadas",
      rows: ["Cartão principal", "Meta da viagem", "Próximo compromisso"],
      prompt: "“O que mudou no meu orçamento esta semana?”",
    },
    store: {
      tabs: ["Projeto", "Catálogo", "LS Vision"],
      smartCatalog: "CATÁLOGO INTELIGENTE",
      explore: "Explore, filtre, encontre.",
      filters: ["Todos", "Camisas", "Acessórios"],
      dataTitle: "Dados para decidir melhor.",
      metrics: ["conversão", "ticket médio", "pedidos"],
      thisWeek: "esta semana",
      platform: "PLATAFORMA DIGITAL",
      hero: ["O futuro da ", " começa aqui."],
      vision: "Uma visão de produto criada para transformar intenção em direção.",
      discover: "Conhecer projeto ↓",
      preview: "Prévia interativa da proposta LS Store",
      navigation: "Explorar proposta LS Store",
      version: "proposta / v1",
      process: ["entender", "desenhar", "alinhar"],
      tabsHint: "clique nas abas",
    },
    legal: {
      preview: "Prévia unificada do ecossistema jurídico",
      ecosystem: "mesmo ecossistema",
      association: "ASSOCIAÇÃO CIVIL DIGITAL",
      collective: "Defesa do consumidor com força coletiva.",
      collectiveLede:
        "Relatos, documentos e demandas em uma jornada clara e responsável.",
      imageAlt: "Atendimento usado na apresentação da ADECEM",
      report: "Relate seu caso →",
      sameClient: "mesmo cliente",
      guidance: "ORIENTAÇÃO INICIAL PARA CONSUMIDOR",
      solve: ["Resolva sua dúvida com ", "clareza e segurança."],
      guided:
        "Um fluxo guiado, humano e direto para encontrar o próximo passo.",
      start: "Iniciar orientação gratuita →",
      benefits: ["2 minutos", "Linguagem humana", "Privacidade"],
      service: "duas frentes / uma evolução contínua",
    },
    total: {
      preview: "Prévia do e-commerce Total Suplements",
      search: "Pesquisar suplementos...",
      premium: "SUPLEMENTAÇÃO PREMIUM",
      lede: "Produtos para recuperação, performance e uma rotina mais forte.",
      buy: "Comprar agora →",
      imageAlt: "Produtos exibidos no e-commerce Total Suplements",
      categories: ["Recuperação", "Performance", "Bem-estar"],
      validation: "validação com cliente real",
    },
    bot: {
      internship: "Bitjuris / estágio",
      nodes: ["gerar", "classificar", "validar", "agendar"],
      verified: "perfil verificado",
      generated: "gerado pelo bot",
      artwork:
        "Post com a frase: Quem domina a lei da tecnologia, domina o futuro da sociedade.",
      artworkLines: ["QUEM DOMINA", "A LEI DA", "TECNOLOGIA,", "DOMINA O", "FUTURO DA", "SOCIEDADE."],
      reviewed: "Publicação revisada e agendada",
      status: "revisado · agendado",
    },
  },
  en: {
    fluxo: {
      hello: "Hello, Natan",
      tagline: "your money, with context",
      balance: "total balance",
      accounts: "4 connected accounts",
      rows: ["Main card", "Travel goal", "Next appointment"],
      prompt: "“What changed in my budget this week?”",
    },
    store: {
      tabs: ["Project", "Catalogue", "LS Vision"],
      smartCatalog: "SMART CATALOGUE",
      explore: "Explore, filter, find.",
      filters: ["All", "Shirts", "Accessories"],
      dataTitle: "Data for better decisions.",
      metrics: ["conversion", "average order", "orders"],
      thisWeek: "this week",
      platform: "DIGITAL PLATFORM",
      hero: ["The future of ", " starts here."],
      vision: "A product vision designed to turn intention into direction.",
      discover: "Discover the project ↓",
      preview: "Interactive preview of the LS Store proposal",
      navigation: "Explore the LS Store proposal",
      version: "proposal / v1",
      process: ["understand", "design", "align"],
      tabsHint: "click the tabs",
    },
    legal: {
      preview: "Unified preview of the legal ecosystem",
      ecosystem: "same ecosystem",
      association: "DIGITAL CIVIL ASSOCIATION",
      collective: "Consumer advocacy through collective strength.",
      collectiveLede:
        "Reports, documents, and claims within a clear and responsible journey.",
      imageAlt: "Consultation featured in the ADECEM presentation",
      report: "Report your case →",
      sameClient: "same client",
      guidance: "INITIAL CONSUMER GUIDANCE",
      solve: ["Resolve your question with ", "clarity and confidence."],
      guided:
        "A guided, human, and direct flow to find the next step.",
      start: "Start free guidance →",
      benefits: ["2 minutes", "Human language", "Privacy"],
      service: "two fronts / one continuous evolution",
    },
    total: {
      preview: "Total Suplements e-commerce preview",
      search: "Search supplements...",
      premium: "PREMIUM SUPPLEMENTS",
      lede: "Products for recovery, performance, and a stronger routine.",
      buy: "Shop now →",
      imageAlt: "Products featured in the Total Suplements e-commerce store",
      categories: ["Recovery", "Performance", "Well-being"],
      validation: "validation with a real client",
    },
    bot: {
      internship: "Bitjuris / internship",
      nodes: ["generate", "classify", "validate", "schedule"],
      verified: "verified profile",
      generated: "generated by the bot",
      artwork:
        "Post with the phrase: Those who master technology law shape society's future.",
      artworkLines: ["THOSE WHO", "MASTER", "TECHNOLOGY LAW", "SHAPE", "SOCIETY'S", "FUTURE."],
      reviewed: "Reviewed and scheduled post",
      status: "reviewed · scheduled",
    },
  },
} as const;

function FluxoPreview() {
  const { locale } = useLanguage();
  const copy = previewCopy[locale].fluxo;

  return (
    <div className={styles.fluxoPreview} aria-hidden="true">
      <span className={styles.financeOrb} />
      <div className={styles.phoneFrame}>
        <div className={styles.phoneStatus}>
          <strong>fluxo</strong>
          <span>9:41</span>
        </div>
        <p>{copy.hello}</p>
        <small>{copy.tagline}</small>
        <div className={styles.balanceCard}>
          <span>{copy.balance}</span>
          <strong>R$ ••••</strong>
          <i>{copy.accounts}</i>
        </div>
        <div className={styles.financeRows}>
          <span><i />{copy.rows[0]}<strong>- R$ 184</strong></span>
          <span><i />{copy.rows[1]}<strong>68%</strong></span>
          <span><i />{copy.rows[2]}<strong>18:30</strong></span>
        </div>
      </div>
      <div className={styles.aiPrompt}>
        <span>fluxo.ai</span>
        <p>{copy.prompt}</p>
      </div>
    </div>
  );
}

type StoreView = "visao" | "catalogo" | "inteligencia";

const storeViewIds: StoreView[] = ["visao", "catalogo", "inteligencia"];

function StoreViewContent({ view }: { view: StoreView }) {
  const { locale } = useLanguage();
  const copy = previewCopy[locale].store;

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
          <span>{copy.smartCatalog}</span>
          <strong>{copy.explore}</strong>
          <div>{copy.filters.map((filter) => <i key={filter}>{filter}</i>)}</div>
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
          <strong>{copy.dataTitle}</strong>
        </div>
        <div className={styles.storeMetrics}>
          <div><small>{copy.metrics[0]}</small><strong>4.7%</strong><i>+0.8%</i></div>
          <div><small>{copy.metrics[1]}</small><strong>R$ 286</strong><i>+12%</i></div>
          <div><small>{copy.metrics[2]}</small><strong>847</strong><i>{copy.thisWeek}</i></div>
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
      <span>{copy.platform}</span>
      <strong>
        {copy.hero[0]}<i>LS Store</i>{copy.hero[1]}
      </strong>
      <p>{copy.vision}</p>
      <b>{copy.discover}</b>
    </motion.div>
  );
}

function StorePreview() {
  const { locale } = useLanguage();
  const copy = previewCopy[locale].store;
  const [view, setView] = useState<StoreView>("visao");

  return (
    <div className={styles.storePreview} aria-label={copy.preview}>
      <div className={styles.storeWindow}>
        <header className={styles.storeHeader}>
          <strong>LS Store</strong>
          <nav aria-label={copy.navigation}>
            {storeViewIds.map((id, index) => (
              <button
                key={id}
                type="button"
                className={view === id ? styles.storeTabActive : undefined}
                onClick={() => setView(id)}
                aria-pressed={view === id}
              >
                {copy.tabs[index]}
              </button>
            ))}
          </nav>
          <span>{copy.version}</span>
        </header>
        <div className={styles.storeViewport}>
          <AnimatePresence mode="wait" initial={false}>
            <StoreViewContent view={view} />
          </AnimatePresence>
        </div>
        <footer className={styles.storeFooter}>
          <span>{copy.process[0]}</span><i />
          <span>{copy.process[1]}</span><i />
          <span>{copy.process[2]}</span>
          <strong>{copy.tabsHint}</strong>
        </footer>
      </div>
    </div>
  );
}

function LegalEcosystemPreview() {
  const { locale } = useLanguage();
  const copy = previewCopy[locale].legal;

  return (
    <div className={styles.servicesPreview} aria-label={copy.preview}>
      <div className={styles.legalBrowser}>
        <div className={`${styles.browserBar} ${styles.legalBrowserBar}`}>
          <span /><span /><span />
          <small>adecem.org</small>
          <i>{copy.ecosystem}</i>
          <small>consumidor360.com.br</small>
        </div>
        <div className={styles.legalSplitScreen}>
          <section className={styles.legalAdecemPane}>
            <div className={styles.legalPaneBrand}>
              <Image src="/projects/legal/adecem-icon.png" width={44} height={44} alt="" />
              <strong>ADECEM</strong>
            </div>
            <span>{copy.association}</span>
            <h5>{copy.collective}</h5>
            <p>{copy.collectiveLede}</p>
            <div className={styles.legalAdecemPhoto}>
              <Image
                src="/projects/legal/adecem-consultation.jpg"
                alt={copy.imageAlt}
                fill
                sizes="(max-width: 780px) 46vw, 25vw"
              />
              <b>{copy.report}</b>
            </div>
          </section>

          <span className={styles.legalBridge} aria-hidden="true">
            <strong>+</strong>
            <small>{copy.sameClient}</small>
          </span>

          <section className={styles.legalConsumerPane}>
            <Image
              src="/projects/legal/consumidor360-logo.jpeg"
              width={190}
              height={92}
              alt="Consumidor 360"
            />
            <span>{copy.guidance}</span>
            <h5>{copy.solve[0]}<i>{copy.solve[1]}</i></h5>
            <p>{copy.guided}</p>
            <b>{copy.start}</b>
            <ul>{copy.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
          </section>
        </div>
      </div>
      <span className={styles.serviceLabel}>{copy.service}</span>
    </div>
  );
}

function TotalSuplementsPreview() {
  const { locale } = useLanguage();
  const copy = previewCopy[locale].total;

  return (
    <div className={styles.totalPreview} aria-label={copy.preview}>
      <span className={styles.totalPlatform}>WordPress + WooCommerce</span>
      <div className={styles.totalWindow}>
        <div className={styles.totalRealHeader}>
          <Image src="/projects/total-suplements/logo.png" width={42} height={42} alt="" />
          <div><span>{copy.search}</span><b>⌕</b></div>
          <i>♙</i><i>☰</i><i>●</i>
        </div>
        <div className={styles.totalRealHero}>
          <div>
            <small>{copy.premium}</small>
            <strong>Total Suplements</strong>
            <p>{copy.lede}</p>
            <b>{copy.buy}</b>
          </div>
          <div className={styles.totalHeroPhoto}>
            <Image
              src="/projects/total-suplements/hero-products.jpg"
              alt={copy.imageAlt}
              fill
              sizes="(max-width: 780px) 90vw, 42vw"
            />
          </div>
        </div>
        <div className={styles.totalCategories}>
          {copy.categories.map((category) => <span key={category}>{category}</span>)}
        </div>
      </div>
      <div className={styles.validationBadge}>
        <span>MVP</span>
        <strong>{copy.validation}</strong>
      </div>
    </div>
  );
}

function AutomationBotPreview() {
  const { locale } = useLanguage();
  const copy = previewCopy[locale].bot;

  return (
    <div className={styles.botPreview} aria-hidden="true">
      <div className={styles.botHeader}>
        <span>{copy.internship}</span>
        <strong>content.pipeline()</strong>
        <i>safe mode</i>
      </div>
      <div className={styles.pipeline}>
        {copy.nodes.map((node, index) => (
          <div key={node} className={styles.pipelineNode}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{node}</strong>
          </div>
        ))}
      </div>
      <div className={styles.xPostWindow}>
        <div className={styles.xWindowBar}>
          <span aria-hidden="true"><i /><i /><i /></span>
          <strong>Post</strong>
          <b aria-hidden="true">𝕏</b>
        </div>
        <div className={styles.xPostCard}>
          <header className={styles.xPostHeader}>
            <span className={styles.xPostAvatar}>B</span>
            <span className={styles.xPostIdentity}>
              <strong>Bitjuris <i aria-label={copy.verified}>✓</i></strong>
              <small>@bitjuris · {copy.generated}</small>
            </span>
            <b aria-hidden="true">•••</b>
          </header>
          <div
            className={styles.xPostArtwork}
            role="img"
            aria-label={copy.artwork}
          >
            <strong>
              {copy.artworkLines.map((line) => <span key={line}>{line}<br /></span>)}
            </strong>
          </div>
          <footer className={styles.xPostFooter} aria-label={copy.reviewed}>
            <span>○</span><span>⇄</span><span>♡</span><span>▥</span>
            <i>{copy.status}</i>
          </footer>
        </div>
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
