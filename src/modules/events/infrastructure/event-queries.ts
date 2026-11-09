import "server-only";
import { listEvents } from "@/modules/events/infrastructure/list-events";
import {
  type Category,
  PERIODS,
  type Period,
} from "@/modules/events/domain/event";
import type { UrlFilters } from "@/modules/events/domain/url-filters";
import { storyBubbles } from "@/modules/events/domain/stories";

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

/** Assez large pour couvrir deux jours de publications. */
const STORY_SCAN = 100;

/**
 * Stories des nouveaux événements (ADR 0025). L'API n'a pas encore de lecture
 * dédiée : on lit les événements en cours et à venir et on garde ceux créés
 * il y a moins de deux jours.
 */
export async function listStories(now = new Date()) {
  const { events } = await listEvents(
    { categories: [], periods: ["ongoing", "upcoming"], pages: [] },
    0,
    STORY_SCAN,
  );
  return storyBubbles(events, now);
}
