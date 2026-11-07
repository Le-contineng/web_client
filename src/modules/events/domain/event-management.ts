import type { Event, Period } from "@/modules/events/domain/event";

/** Onglets de la liste de gestion des événements d'une page. */
export const MANAGEMENT_TABS = [
  "upcoming",
  "ongoing",
  "past",
  "cancelled",
] as const;
export type ManagementTab = (typeof MANAGEMENT_TABS)[number];

type Managed = Pick<Event, "status" | "startsAt"> & { period: Period };

/** Onglet d'un événement : annulé d'abord, sinon sa période. */
export function managementTab(event: Managed): ManagementTab {
  return event.status === "cancelled" ? "cancelled" : event.period;
}

/** Onglet lu dans l'adresse ; « À venir » par défaut. */
export function readManagementTab(value: unknown): ManagementTab {
  return MANAGEMENT_TABS.includes(value as ManagementTab)
    ? (value as ManagementTab)
    : "upcoming";
}

/**
 * Événements d'un onglet, dans l'ordre utile : le plus proche d'abord pour
 * ce qui arrive ou se déroule, le plus récent d'abord pour le reste.
 */
export function eventsOfTab<T extends Managed>(
  events: readonly T[],
  tab: ManagementTab,
): T[] {
  const soonestFirst = tab === "upcoming" || tab === "ongoing";
  return events
    .filter((event) => managementTab(event) === tab)
    .sort((a, b) => {
      const diff = Date.parse(a.startsAt) - Date.parse(b.startsAt);
      return soonestFirst ? diff : -diff;
    });
}

/** Nombre d'événements par onglet. */
export function countByTab(
  events: readonly Managed[],
): Record<ManagementTab, number> {
  const counts = { upcoming: 0, ongoing: 0, past: 0, cancelled: 0 };
  for (const event of events) counts[managementTab(event)] += 1;
  return counts;
}
