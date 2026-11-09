import { effectiveEnd } from "@/modules/events/domain/event";
import type {
  EventView,
  PageSummary,
} from "@/modules/events/domain/event-view.types";

/**
 * Stories des nouveaux événements (ADR 0025) : un événement y reste deux jours
 * après sa création, jamais au-delà de sa fin. Il reste aussi dans le fil.
 */
export const STORY_MAX_MS = 2 * 24 * 60 * 60 * 1000;

/** Fin de la story : deux jours après la création, ou la fin de l'événement si elle arrive avant. */
export function storyEnd(
  event: Pick<EventView, "createdAt" | "startsAt" | "endsAt">,
): Date {
  const max = new Date(new Date(event.createdAt).getTime() + STORY_MAX_MS);
  const end = effectiveEnd(event);
  return end < max ? end : max;
}

export function isStory(
  event: Pick<EventView, "createdAt" | "startsAt" | "endsAt" | "status">,
  now: Date,
): boolean {
  if (event.status === "cancelled") return false;
  return new Date(event.createdAt) <= now && now < storyEnd(event);
}

/** Une bulle par page : ses nouveaux événements, du plus ancien au plus récent. */
export type StoryBubble = {
  organizer: PageSummary;
  events: EventView[];
};

/** Bulles des événements en story, la page qui a publié le plus récemment d'abord. */
export function storyBubbles(
  events: readonly EventView[],
  now: Date,
): StoryBubble[] {
  const created = (e: EventView) => new Date(e.createdAt).getTime();
  const byPage = new Map<string, StoryBubble>();
  for (const event of [...events]
    .filter((e) => isStory(e, now))
    .sort((a, b) => created(a) - created(b))) {
    const bubble = byPage.get(event.organizer.id);
    if (bubble) bubble.events.push(event);
    else
      byPage.set(event.organizer.id, {
        organizer: event.organizer,
        events: [event],
      });
  }
  const latest = (b: StoryBubble) => created(b.events[b.events.length - 1]!);
  return [...byPage.values()].sort((a, b) => latest(b) - latest(a));
}

/** Une bulle est vue quand toutes ses stories ont été vues. */
export function isSeen(
  bubble: StoryBubble,
  seen: ReadonlySet<string>,
): boolean {
  return bubble.events.every((event) => seen.has(event.id));
}

/** Non vues avant vues, l'ordre d'origine gardé dans chaque groupe. */
export function orderBubbles(
  bubbles: StoryBubble[],
  seen: ReadonlySet<string>,
): StoryBubble[] {
  const rank = (b: StoryBubble) => (isSeen(b, seen) ? 1 : 0);
  return bubbles
    .map((bubble, index) => ({ bubble, index }))
    .sort((a, b) => rank(a.bubble) - rank(b.bubble) || a.index - b.index)
    .map(({ bubble }) => bubble);
}

/** Au-delà, les plus anciens identifiants vus sont oubliés. */
export const SEEN_LIMIT = 300;

/** Ajoute des identifiants vus, les plus récents à la fin, sans doublon. */
export function addSeen(seen: string[], ids: string[]): string[] {
  const next = [...seen.filter((id) => !ids.includes(id)), ...ids];
  return next.slice(-SEEN_LIMIT);
}
