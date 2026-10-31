import {
  CATEGORIES,
  type Category,
  DEFAULT_FILTERS,
  PERIODS,
  type Period,
} from "@/modules/events/domain/event";

/**
 * Filtres repris dans l'adresse (US-17) pour qu'un lien filtré se partage :
 * ?category=party,culture&period=past&page=bde,club-foot
 * Les pages sont désignées par leur slug, plus lisible dans un lien.
 */
export type UrlFilters = {
  categories: Category[];
  periods: Period[];
  pages: string[];
};

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function values(params: Params, key: string): string[] {
  const raw = params instanceof URLSearchParams ? params.get(key) : params[key];
  const text = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  return text
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function readUrlFilters(params: Params): UrlFilters {
  const periods = values(params, "period").filter((p): p is Period =>
    (PERIODS as readonly string[]).includes(p),
  );
  return {
    categories: values(params, "category").filter((c): c is Category =>
      (CATEGORIES as readonly string[]).includes(c),
    ),
    periods: periods.length ? periods : [...DEFAULT_FILTERS.periods],
    pages: values(params, "page"),
  };
}

export function isDefault(f: UrlFilters): boolean {
  const periods = [...f.periods].sort().join();
  return (
    !f.categories.length &&
    !f.pages.length &&
    periods === [...DEFAULT_FILTERS.periods].sort().join()
  );
}

export function writeUrlFilters(f: UrlFilters): string {
  const params = new URLSearchParams();
  if (f.categories.length) params.set("category", f.categories.join(","));
  if (f.periods.length && !isDefault({ ...f, categories: [], pages: [] }))
    params.set("period", f.periods.join(","));
  if (f.pages.length) params.set("page", f.pages.join(","));
  return params.toString().replaceAll("%2C", ",");
}
