"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "contineng.posts.seen";
const SEEN_EVENT = "posts-seen";
/** Au-delà, les événements les plus anciens sont oubliés. */
const LIMIT = 300;
/** Repli quand le stockage est indisponible (navigation privée) : cette visite seulement. */
let memory = "{}";

function subscribe(onChange: () => void) {
  window.addEventListener(SEEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SEEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function snapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function parse(raw: string): Record<string, string> {
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

/**
 * Dernier post vu, par événement, sur cet appareil : simple confort (la
 * tuile s'anime tant qu'il y a du nouveau), d'où le stockage local.
 */
export function useLastSeenPosts(eventId: string) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}");
  const lastSeenAt = parse(raw)[eventId] ?? null;
  const markSeen = useCallback(
    (latestAt: string) => {
      const all = parse(snapshot());
      if (all[eventId] && new Date(all[eventId]) >= new Date(latestAt)) return;
      delete all[eventId];
      const entries = [...Object.entries(all), [eventId, latestAt]].slice(
        -LIMIT,
      );
      memory = JSON.stringify(Object.fromEntries(entries));
      try {
        localStorage.setItem(KEY, memory);
      } catch {
        // Stockage indisponible : retenu en mémoire pour cette visite
      }
      window.dispatchEvent(new Event(SEEN_EVENT));
    },
    [eventId],
  );
  return { lastSeenAt, markSeen };
}
