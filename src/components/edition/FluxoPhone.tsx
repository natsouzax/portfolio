"use client";

import { useState } from "react";
import styles from "./FluxoPhone.module.css";

/**
 * Fluxo as the thing itself: a phone with the month already sorted. Choosing a
 * category narrows the statement and moves the bar, which is the product's one
 * real gesture — seeing where the month went.
 *
 * The figures are a demonstration, not anyone's account.
 */
const CATEGORIES = [
  { id: "food", label: "Food", share: 34, tone: "a" },
  { id: "home", label: "Home", share: 28, tone: "b" },
  { id: "travel", label: "Travel", share: 23, tone: "c" },
  { id: "other", label: "Other", share: 15, tone: "d" },
] as const;

const ENTRIES = [
  { id: 1, name: "Pingo Doce", when: "Today", amount: -38.4, category: "food" },
  { id: 2, name: "Rent · Nov", when: "02 Nov", amount: -620, category: "home" },
  { id: 3, name: "Metro pass", when: "02 Nov", amount: -42, category: "travel" },
  { id: 4, name: "Lexuri invoice", when: "01 Nov", amount: 1480, category: "other" },
  { id: 5, name: "Café Central", when: "01 Nov", amount: -6.8, category: "food" },
  { id: 6, name: "Electricity", when: "31 Oct", amount: -71.2, category: "home" },
];

const money = (value: number) =>
  `${value < 0 ? "−" : "+"}€${Math.abs(value).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FluxoPhone() {
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? ENTRIES.filter(entry => entry.category === filter) : ENTRIES;
  const total = shown.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className={styles.scene}>
      <div className={styles.phone}>
        <div className={styles.screen}>
          <header className={styles.bar}>
            <span>9:41</span>
            <i className={styles.notch} aria-hidden="true" />
            <span aria-hidden="true">▂▄▆ ▮</span>
          </header>

          <div className={styles.account}>
            <span className={styles.label}>{filter ? CATEGORIES.find(c => c.id === filter)?.label : "November"}</span>
            <strong className={styles.total} key={total}>{money(total)}</strong>
          </div>

          {/* One bar for the month, each category holding its share. */}
          <div className={styles.split} role="img" aria-label="Spending split by category">
            {CATEGORIES.map(category => (
              <i
                key={category.id}
                data-tone={category.tone}
                data-dim={filter && filter !== category.id ? "" : undefined}
                style={{ flexGrow: category.share }}
              />
            ))}
          </div>

          <div className={styles.chips}>
            <button type="button" data-on={filter === null ? "" : undefined} onClick={() => setFilter(null)}>All</button>
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                type="button"
                data-tone={category.tone}
                data-on={filter === category.id ? "" : undefined}
                onClick={() => setFilter(filter === category.id ? null : category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <ul className={styles.statement}>
            {shown.map((entry, i) => (
              <li key={entry.id} style={{ "--i": i } as React.CSSProperties}>
                <i data-tone={CATEGORIES.find(c => c.id === entry.category)?.tone} aria-hidden="true" />
                <span>
                  <strong>{entry.name}</strong>
                  <small>{entry.when}</small>
                </span>
                <b data-in={entry.amount > 0 ? "" : undefined}>{money(entry.amount)}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
