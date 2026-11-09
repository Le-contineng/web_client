import "server-only";
import { listEvents } from "@/modules/events/infrastructure/list-events";
import {
  type Category,
  PERIODS,
  type Period,
} from "@/modules/events/domain/event";
import type { UrlFilters } from "@/modules/events/domain/url-filters";
import { STORY_MAX_MS, storyBubbles } from "@/modules/events/domain/stories";

/** Liste filtrée par l'adresse (US-17) ; les pages y sont désignées par leur slug. */
export function listEventsFromUrl(
  filters: UrlFilters,
  offset = 0,
  asOf?: string,
) {
  return listEvents(filters, offset, undefined, asOf);
}

/** Nombre maximal de vignettes affichées par une recherche. */
const MAX_RESULTS = 60;

/**
 * Recherche (onglet Rechercher) : texte sur le nom, le lieu, la description
 * et la page organisatrice ; période unique ou toutes ; catégories (OU).
 */
export async function searchEvents(r: {
  text: string;
  period: Period | null;
  categories: Category[];
}) {
  const { events, total } = await listEvents(
    {
      categories: r.categories,
      periods: r.period ? [r.period] : [...PERIODS],
      pages: [],
      search: r.text,
    },
    0,
    MAX_RESULTS,
  );
  return { events, total };
}

/** Plafond par sécurité : l'API ne renvoie déjà que deux jours de publications. */
const STORY_LIMIT = 100;

/**
 * Stories des nouveaux événements (ADR 0025) : l'API ne renvoie que les
 * événements en cours et à venir créés depuis deux jours (`createdAfter`) ;
 * la règle complète (fin de l'événement, annulation) est appliquée ici.
 */
export async function listStories(now = new Date()) {
  const { events } = await listEvents(
    {
      categories: [],
      periods: ["ongoing", "upcoming"],
      pages: [],
      createdAfter: new Date(now.getTime() - STORY_MAX_MS),
    },
    0,
    STORY_LIMIT,
  );
  return storyBubbles(events, now);
}
