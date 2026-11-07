"use client";

import { useFormatter, useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  pollState,
  storyTone,
  type EventStory,
} from "@/modules/events/domain/event-story";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { LivePoll } from "@/modules/events/presentation/components/LivePoll";
import {
  STORY_ICONS,
  TONE_CLASSES,
} from "@/modules/events/presentation/components/story-kind";
import { PaperPlaneTiltIcon, XIcon } from "@/shared/components/icons";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { cn } from "@/shared/lib/utils";

/** Durée d'un contenu avant de passer au suivant. */
const DURATION_MS = 5000;

/**
 * Statuts d'un événement en plein écran (ADR 0023) : une barre de progression
 * par contenu, toucher à gauche pour revenir, ailleurs pour avancer ; après le
 * dernier, le statut se ferme. Un sondage ouvert ne défile pas tout seul, pour
 * laisser le temps de voter.
 */
export function StoryViewer({
  event,
  start,
  onSeen,
  onClose,
}: {
  event: EventView;
  start: number;
  onSeen: (id: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations("stories");
  const format = useFormatter();
  const stories = event.stories ?? [];
  const [index, setIndex] = useState(start);
  const story = stories[index];
  const dialog = useRef<HTMLDivElement>(null);
  const live =
    story?.kind === "poll" &&
    !!story.poll &&
    pollState(story.poll, new Date()) === "open";

  const next = () =>
    index + 1 < stories.length ? setIndex(index + 1) : onClose();
  const previous = () => setIndex(Math.max(0, index - 1));

  useEffect(() => {
    if (story) onSeen(story.id);
  }, [story, onSeen]);

  // Le minuteur avance même si les animations sont réduites (la barre, elle, ne bouge pas)
  const advance = useRef(next);
  useEffect(() => {
    advance.current = next;
  });
  useEffect(() => {
    if (live) return;
    const timer = setTimeout(() => advance.current(), DURATION_MS);
    return () => clearTimeout(timer);
  }, [index, live]);

  // Plein écran : la page dessous ne défile plus, Échap ferme
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  // Clavier écouté sur le document : un clic dans le statut ne lui retire pas le focus
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") advance.current();
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!story) return null;

  // Un toucher hors des contrôles navigue : premier tiers pour revenir
  function onTap(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a, button, [data-interactive]"))
      return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    if (e.clientX - left < width / 3) previous();
    else next();
  }

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal
      aria-label={event.name}
      tabIndex={-1}
      className="fixed inset-0 z-50 grid place-items-center bg-black/90 outline-none"
    >
      <div
        onClick={onTap}
        className={cn(
          "relative flex h-svh w-full flex-col overflow-hidden transition-colors duration-500 select-none sm:h-[min(92svh,860px)] sm:max-w-md sm:rounded-xl",
          TONE_CLASSES[storyTone(story.kind)],
        )}
      >
        {/* Une barre par contenu : vue, en cours, à venir */}
        <div className="flex gap-1 px-3 pt-3" aria-hidden>
          {stories.map((s, i) => (
            <span
              key={s.id}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35"
            >
              <span
                key={i === index ? `${s.id}-${index}` : s.id}
                className={cn(
                  "block h-full origin-left bg-white",
                  i < index && "scale-x-100",
                  i > index && "scale-x-0",
                  i === index && (live ? "scale-x-100" : "animate-story"),
                )}
                style={
                  i === index && !live
                    ? { animationDuration: `${DURATION_MS}ms` }
                    : undefined
                }
              />
            </span>
          ))}
        </div>

        <header className="flex items-center gap-2.5 px-3 pt-3">
          <ProfileAvatar
            name={event.organizer.name}
            photo={event.organizer.photoUrl}
            size="sm"
          />
          <div className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-sm font-semibold">
              {event.organizer.name}
            </span>
            <span className="truncate text-xs opacity-80">
              {event.name} ·{" "}
              {format.dateTime(new Date(event.startsAt), {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="grid size-10 place-items-center rounded-full outline-none hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/50"
          >
            <XIcon className="size-6" />
          </button>
        </header>

        <StoryBody key={story.id} event={event} story={story} />

        {story.actionUrl && (
          <div className="px-4 pb-6">
            <a
              href={story.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-ink outline-none focus-visible:ring-3 focus-visible:ring-white/50"
            >
              <PaperPlaneTiltIcon className="size-5" weight="bold" />
              {t(`action.${story.kind}`)}
            </a>
          </div>
        )}

        {/* Navigation au clavier et pour les lecteurs d'écran */}
        <div className="sr-only">
          <button type="button" onClick={previous}>
            {t("previous")}
          </button>
          <button type="button" onClick={next}>
            {t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}

function StoryBody({ event, story }: { event: EventView; story: EventStory }) {
  const t = useTranslations("stories");
  const format = useFormatter();
  const Icon = STORY_ICONS[story.kind];
  const poll = story.poll;
  const state = poll ? pollState(poll, new Date()) : null;

  if (poll && state !== "upcoming") {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 px-4 py-6">
        <div className="grid gap-1 text-center">
          <p className="text-xs font-bold tracking-widest uppercase opacity-80">
            {t(`kind.${story.kind}`)}
          </p>
          <h2 className="text-2xl leading-tight font-bold text-balance">
            {poll.question}
          </h2>
        </div>
        <LivePoll eventId={event.id} initial={poll} signedIn={!!event.viewer} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8 text-center motion-safe:animate-rise">
      <span className="grid size-32 place-items-center content-center gap-2 rounded-md bg-white text-sm font-bold tracking-wide text-brand uppercase shadow-lg">
        <Icon className="size-12" weight="bold" />
        {t(`tile.${story.kind}`)}
      </span>
      <div className="grid gap-2">
        <p className="text-xs font-bold tracking-widest uppercase opacity-80">
          {t(`kind.${story.kind}`)}
        </p>
        <h2 className="text-2xl leading-tight font-bold text-balance">
          {story.title}
        </h2>
        {poll?.opensAt && (
          <p className="text-sm opacity-90">
            {t("poll.opensOn", {
              date: format.dateTime(new Date(poll.opensAt), {
                day: "numeric",
                month: "long",
              }),
            })}
          </p>
        )}
        {story.detail && (
          <p className="text-base text-pretty opacity-90">{story.detail}</p>
        )}
      </div>
    </div>
  );
}
