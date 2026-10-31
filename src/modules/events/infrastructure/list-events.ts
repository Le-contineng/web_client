import "server-only";
import { eventsApi } from "@/modules/events/infrastructure/events.api";
import { PAGE_SIZE } from "@/modules/events/domain/event";
import type { UrlFilters } from "@/modules/events/domain/url-filters";

/**
 * Liste publique (US-01, US-16, US-17) : filtres repris de l'adresse (pages
 * désignées par leur slug), recherche texte, tranche à partir de `offset`.
 * `asOf` (renvoyé par la première tranche) fait classer les suivantes pour le
 * même instant : ni doublon ni trou pendant le défilement (ADR 0020).
 */
export function listEvents(
  filters: UrlFilters & { search?: string },
  offset = 0,
  limit = PAGE_SIZE,
  asOf?: string,
) {
  const p = new URLSearchParams();
  if (filters.categories.length)
    p.set("category", filters.categories.join(","));
  if (filters.periods.length) p.set("period", filters.periods.join(","));
  if (filters.pages.length) p.set("page", filters.pages.join(","));
  if (filters.search) p.set("q", filters.search);
  p.set("offset", String(offset));
  p.set("limit", String(limit));
  if (asOf) p.set("asOf", asOf);
  return eventsApi.list(p);
}
