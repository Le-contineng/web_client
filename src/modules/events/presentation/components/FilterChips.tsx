"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import {
  CATEGORIES,
  type Category,
  PERIODS,
  type Period,
} from "@/modules/events/domain/event";

/**
 * Filtres en pastilles, façon notifications TikTok : une ligne pour la
 * période (choix unique, « Tous » par défaut), une ligne pour les catégories
 * (choix multiple). Chaque pastille est un lien : l'état vit dans l'adresse.
 */
export function FilterChips({
  period,
  categories,
}: {
  period: Period | null;
  categories: Category[];
}) {
  const t = useTranslations();
  const path = usePathname();
  const params = useSearchParams();

  function link(change: (p: URLSearchParams) => void) {
    const nextEvents = new URLSearchParams(params);
    change(nextEvents);
    const query = nextEvents.toString().replaceAll("%2C", ",");
    return query ? `${path}?${query}` : path;
  }

  const toPeriod = (p: Period | null) =>
    link((s) => (p ? s.set("period", p) : s.delete("period")));

  const toCategory = (c: Category) =>
    link((s) => {
      const nextValues = categories.includes(c)
        ? categories.filter((x) => x !== c)
        : [...categories, c];
      if (nextValues.length) s.set("category", nextValues.join(","));
      else s.delete("category");
    });

  return (
    <div className="grid gap-2">
      <ChipRow label={t("filters.period")}>
        <Chip href={toPeriod(null)} active={period === null}>
          {t("search.all")}
        </Chip>
        {PERIODS.map((p) => (
          <Chip key={p} href={toPeriod(p)} active={period === p}>
            {t(`periods.${p}`)}
          </Chip>
        ))}
      </ChipRow>
      <ChipRow label={t("filters.category")}>
        {CATEGORIES.map((c) => (
          <Chip key={c} href={toCategory(c)} active={categories.includes(c)}>
            {t(`categories.${c}`)}
          </Chip>
        ))}
      </ChipRow>
    </div>
  );
}

function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ul
      aria-label={label}
      className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {children}
    </ul>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <li className="shrink-0">
      <Link
        href={href}
        scroll={false}
        // Chaque filtre est une nouvelle adresse : les robots ne les suivent pas
        rel="nofollow"
        aria-current={active ? "true" : undefined}
        className={cn(
          "inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors",
          active
            ? "bg-foreground text-background"
            : "bg-muted text-foreground hover:bg-accent",
        )}
      >
        {children}
      </Link>
    </li>
  );
}
