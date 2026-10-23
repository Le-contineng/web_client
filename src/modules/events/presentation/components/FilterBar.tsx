"use client";

import { ChevronDownIcon, RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useTransition } from "react";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import type { PageSummary } from "@/modules/events/domain/event-view.types";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
  PERIODS,
} from "@/modules/events/domain/event";
import {
  writeUrlFilters,
  isDefault,
  type UrlFilters,
} from "@/modules/events/domain/url-filters";

/**
 * Filtres Catégorie, Période et Page (US-17), utilisables sans connexion.
 * Chaque changement met à jour l'adresse : un lien filtré se partage.
 */
export function FilterBar({
  filters,
  pages,
}: {
  filters: UrlFilters;
  pages: PageSummary[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const path = usePathname();
  const [enCours, startTransition] = useTransition();

  const apply = (nextEvents: UrlFilters) =>
    startTransition(() => {
      const query = writeUrlFilters(nextEvents);
      router.push(query ? `${path}?${query}` : path, { scroll: false });
    });

  function toggle<K extends keyof UrlFilters>(
    key: K,
    value: UrlFilters[K][number],
  ) {
    const currentValues = filters[key] as string[];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    apply({ ...filters, [key]: nextValues });
  }

  const periodChanged = !isDefault({
    ...filters,
    categories: [],
    pages: [],
  });

  return (
    <div
      className={cn(
        "-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:px-0",
        enCours && "opacity-70",
      )}
      aria-busy={enCours}
    >
      <Filter
        label={t("filters.period")}
        count={filters.periods.length}
        active={periodChanged}
      >
        {PERIODS.map((p) => (
          <Option
            key={p}
            checked={filters.periods.includes(p)}
            onChange={() => toggle("periods", p)}
          >
            {t(`periods.${p}`)}
          </Option>
        ))}
      </Filter>
      <Filter
        label={t("filters.category")}
        count={filters.categories.length}
        active={filters.categories.length > 0}
      >
        {CATEGORIES.map((c) => (
          <Option
            key={c}
            checked={filters.categories.includes(c)}
            onChange={() => toggle("categories", c)}
          >
            {t(`categories.${c}`)}
          </Option>
        ))}
      </Filter>
      <Filter
        label={t("filters.page")}
        count={filters.pages.length}
        active={filters.pages.length > 0}
      >
        {pages.map((p) => (
          <Option
            key={p.slug}
            checked={filters.pages.includes(p.slug)}
            onChange={() => toggle("pages", p.slug)}
          >
            <ProfileAvatar name={p.name} photo={p.photoUrl} size="xs" />
            {p.name}
          </Option>
        ))}
      </Filter>
      {!isDefault(filters) && (
        <Button
          variant="glass"
          size="pill"
          className="shrink-0 px-4 text-sm"
          onClick={() =>
            apply({
              categories: [],
              periods: [...DEFAULT_FILTERS.periods],
              pages: [],
            })
          }
        >
          <RotateCcwIcon /> {t("filters.reset")}
        </Button>
      )}
    </div>
  );
}

function Filter({
  label,
  count,
  active,
  children,
}: {
  label: string;
  count: number;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={active ? "glass-ink" : "glass"}
            size="pill"
            className="shrink-0 gap-1.5 pr-3.5 pl-4 text-sm"
          />
        }
      >
        {label}
        {active && count > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-current/20 px-1.5 text-xs tabular-nums">
            {count}
          </span>
        )}
        <ChevronDownIcon />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="ct-glass ct-menu w-64 gap-0 p-1.5"
      >
        <ul className="grid">{children}</ul>
      </PopoverContent>
    </Popover>
  );
}

function Option({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <li>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-sm font-medium hover:bg-foreground/7">
        <Checkbox checked={checked} onCheckedChange={onChange} />
        {children}
      </label>
    </li>
  );
}
