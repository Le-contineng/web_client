import "server-only";
import { cache } from "react";
import {
  eventsApi,
  type EventPayload,
} from "@/modules/events/infrastructure/events.api";

export type {
  EventPayload,
  EventSlice,
} from "@/modules/events/infrastructure/events.api";
export { listEvents } from "@/modules/events/infrastructure/list-events";
export {
  listEventsFromUrl,
  searchEvents,
} from "@/modules/events/infrastructure/event-queries";

export const getEventById = cache((id: string) => eventsApi.getById(id));
export const getPageEvents = cache((slug: string) =>
  eventsApi.listByPage(slug),
);

// ——— Écriture au nom d'une page dont on est membre (US-11, US-15) ———
export const createEvent = (pageId: string, d: EventPayload) =>
  eventsApi.create(pageId, d);
export const updateEvent = (pageId: string, id: string, d: EventPayload) =>
  eventsApi.update(pageId, id, d);
export const cancelEvent = (pageId: string, id: string, reason: string) =>
  eventsApi.cancel(pageId, id, reason);

// ——— Intérêt d'un compte connecté (ADR 0022 du backend) ———
export const setInterest = eventsApi.setInterest;

// ——— Épinglage éditorial (admins, ADR 0020 du backend) ———
export const pinEvent = eventsApi.pin;
export const unpinEvent = eventsApi.unpin;
export const deleteEvent = eventsApi.remove;
