"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SEGMENT_CLASS, Segmented } from "@/shared/components/Segmented";
import { cn } from "@/shared/lib/utils";
import {
  CATEGORIES,
  type Category,
  PERIODS,
  type Period,
} from "@/modules/events/domain/event";
import {
  CAPSULE_CLASS,
  CapsuleMark,
  chipStyle,
} from "@/modules/events/presentation/components/CategoryChips";

/**
 * Filtres de la recherche : la période en contrôle segmenté (choix unique,
 * « Tous » par défaut), les catégories en capsules (choix multiple). Chaque
 * choix est un lien : l'état vit dans l'adresse.
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

  const periods = [null, ...PERIODS] as const;

  return (
    <div className="grid gap-3">
      <Segmented
        label={t("filters.period")}
        index={periods.indexOf(period)}
        count={periods.length}
        className="w-full sm:max-w-md"
      >
        {periods.map((p) => (
          <Link
            key={p ?? "all"}
            href={toPeriod(p)}
            scroll={false}
            aria-current={period === p ? "true" : undefined}
            className={SEGMENT_CLASS}
          >
            {p ? t(`periods.${p}`) : t("search.all")}
          </Link>
        ))}
      </Segmented>
      <ul
        aria-label={t("filters.category")}
        className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {CATEGORIES.map((c) => (
          <li key={c} className="shrink-0">
            <Link
              href={toCategory(c)}
              scroll={false}
              aria-current={categories.includes(c) ? "true" : undefined}
              className={cn(
                CAPSULE_CLASS,
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
              style={chipStyle(c)}
            >
              <CapsuleMark />
              {t(`categories.${c}`)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
