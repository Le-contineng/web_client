"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { StoryBubble } from "@/modules/events/domain/stories";
import {
  EventStage,
  SWIPE_MIN,
} from "@/modules/events/presentation/components/EventStage";

/** Durée d'un écran avant de passer au suivant. */
export const SCREEN_MS = 5000;

/**
 * Story plein écran des nouveaux événements (ADR 0025) : chaque écran est la
 * fiche plein écran elle-même (EventStage), avec sa colonne d'actions et son
 * panneau d'informations, plus la progression en haut. Un écran par
 * événement, la bulle suivante ensuite, fermeture après la dernière. Avance
 * seule ; un appui maintenu ou le panneau ouvert mettent en pause ; toucher
 * la gauche ou la droite de l'affiche recule ou avance ; flèches et Échap au
 * clavier.
 */
export function StoryViewer({
  bubbles,
  start,
  onSeen,
  onShare,
  onClose,
}: {
  bubbles: StoryBubble[];
  start: number;
  onSeen: (eventId: string) => void;
  onShare?: (eventId: string) => Promise<void>;
  onClose: () => void;
}) {
  const t = useTranslations("stories");
  const [position, setPosition] = useState({ bubble: start, screen: 0 });
  const [paused, setPaused] = useState(false);
  // Panneau d'informations ouvert : la story attend qu'on le referme
  const [reading, setReading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const pressedAt = useRef(0);
  const pressedFrom = useRef({ x: 0, y: 0 });
  const elapsedRef = useRef(0);

  const bubble = bubbles[position.bubble];
  const event = bubble?.events[position.screen];

  const next = useCallback(() => {
    setReading(false);
    elapsedRef.current = 0;
    setElapsed(0);
    setPosition(({ bubble: b, screen: s }) => {
      if (s + 1 < (bubbles[b]?.events.length ?? 0))
        return { bubble: b, screen: s + 1 };
      return { bubble: b + 1, screen: 0 };
    });
  }, [bubbles]);

  const previous = useCallback(() => {
    setReading(false);
    elapsedRef.current = 0;
    setElapsed(0);
    setPosition(({ bubble: b, screen: s }) => {
      if (s > 0) return { bubble: b, screen: s - 1 };
      if (b > 0)
        return {
          bubble: b - 1,
          screen: (bubbles[b - 1]?.events.length ?? 1) - 1,
        };
      return { bubble: b, screen: s };
    });
  }, [bubbles]);

  // Après le dernier écran de la dernière bulle
  useEffect(() => {
    if (!bubble) onClose();
  }, [bubble, onClose]);

  // Un écran affiché compte comme vu, et comme une vue de l'événement (une fois)
  const seenRef = useRef(onSeen);
  useEffect(() => {
    seenRef.current = onSeen;
  });
  const eventId = event?.id;
  useEffect(() => {
    if (eventId) seenRef.current(eventId);
  }, [eventId]);

  useEffect(() => {
    if (paused || reading || !event) return;
    const tick = 50;
    const timer = setInterval(() => {
      elapsedRef.current += tick;
      if (elapsedRef.current >= SCREEN_MS) next();
      else setElapsed(elapsedRef.current);
    }, tick);
    return () => clearInterval(timer);
  }, [paused, reading, event, next]);

  useEffect(() => {
    if (reading) return; // Échap ferme alors le panneau, pas la story
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reading, next, previous, onClose]);

  // Le fil ne défile pas derrière la story
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  if (!bubble || !event) return null;

  const progress = (
    <div className="flex gap-1">
      {bubble.events.map((e, i) => (
        <span
          key={e.id}
          className="h-0.5 flex-1 overflow-hidden rounded bg-white/35"
        >
          <span
            className="block h-full bg-white"
            style={{
              width:
                i < position.screen
                  ? "100%"
                  : i === position.screen
                    ? `${Math.min(100, (elapsed / SCREEN_MS) * 100)}%`
                    : "0%",
            }}
          />
        </span>
      ))}
    </div>
  );

  // Gauche recule, droite avance ; appui maintenu = pause ; glisser vers le haut = panneau
  const touch = (
    <div
      className="size-full"
      onPointerDown={(e) => {
        pressedAt.current = Date.now();
        pressedFrom.current = { x: e.clientX, y: e.clientY };
        setPaused(true);
      }}
      onPointerUp={(e) => {
        setPaused(false);
        if (Date.now() - pressedAt.current > 250) return;
        // Un glissement (vers le haut : la fiche ouvre son panneau) n'est pas un toucher
        const moved = Math.hypot(
          e.clientX - pressedFrom.current.x,
          e.clientY - pressedFrom.current.y,
        );
        if (moved > SWIPE_MIN / 2) return;
        const box = e.currentTarget.getBoundingClientRect();
        if (e.clientX - box.left < box.width / 3) previous();
        else next();
      }}
      onPointerLeave={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={previous}
        aria-label={t("previous")}
        className="sr-only focus:not-sr-only"
      />
      <button
        type="button"
        onClick={next}
        aria-label={t("nextScreen")}
        className="sr-only focus:not-sr-only"
      />
    </div>
  );

  // Rendue dans <body>, sous les panneaux et menus de la fiche (z-50, ajoutés après)
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("storyOf", { page: bubble.organizer.name })}
      className="fixed inset-0 z-50 grid place-items-center bg-black"
    >
      <div className="relative h-full w-full max-w-[28rem] overflow-hidden sm:h-[min(92vh,52rem)] sm:rounded-lg">
        <EventStage
          key={event.id}
          event={event}
          share={{
            url: `${window.location.origin}/e/${event.id}`,
            onShare: onShare ? () => onShare(event.id) : undefined,
          }}
          story={{ onClose, progress, touch }}
          onOpenChange={setReading}
          className="absolute"
        />
      </div>
    </div>,
    document.body,
  );
}
