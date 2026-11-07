"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "contineng.stories.seen";
const SEEN_EVENT = "stories-seen";
/** Au-delà, les plus anciens contenus vus sont oubliés. */
const LIMIT = 500;
/** Repli quand le stockage est indisponible (navigation privée) : cette visite seulement. */
let memory = "[]";

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

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Contenus déjà vus sur cet appareil : simple confort de lecture (le halo
 * passe au suivant), sans valeur à conserver, d'où le stockage local.
 */
export function useSeenStories() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const seen = useMemo<ReadonlySet<string>>(() => new Set(parse(raw)), [raw]);
  const markSeen = useCallback((id: string) => {
    const current = parse(snapshot());
    if (current.includes(id)) return;
    memory = JSON.stringify([...current, id].slice(-LIMIT));
    try {
      localStorage.setItem(KEY, memory);
    } catch {
      // Stockage indisponible : retenu en mémoire pour cette visite
    }
    window.dispatchEvent(new Event(SEEN_EVENT));
  }, []);
  return { seen, markSeen };
}
