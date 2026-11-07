"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  firstUnseen,
  VISIBLE_TILES,
} from "@/modules/events/domain/event-story";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { StoryViewer } from "@/modules/events/presentation/components/StoryViewer";
import { STORY_ICONS } from "@/modules/events/presentation/components/story-kind";
import { useSeenStories } from "@/modules/events/presentation/components/useSeenStories";
import { cn } from "@/shared/lib/utils";

const TILE =
  "grid h-full w-12 place-items-center content-center gap-1 rounded-[4px] border bg-card px-1 py-1.5 text-[9px] font-bold tracking-wide text-brand uppercase shadow-xs outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95";

/**
 * Tuiles des contenus de l'événement (ADR 0023), en petits papiers à côté de
 * la tuile de date : chacune ouvre les statuts sur son contenu, « +N » sur le
 * premier contenu caché. Le halo marque le premier contenu pas encore vu.
 */
export function StoryTiles({
  event,
  className,
}: {
  event: EventView;
  className?: string;
}) {
  const t = useTranslations("stories");
  const stories = event.stories ?? [];
  const { seen, markSeen } = useSeenStories();
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (stories.length === 0) return null;
  const halo = firstUnseen(stories, seen);
  const hidden = stories.length - VISIBLE_TILES;

  return (
    <>
      <ul aria-label={t("tiles")} className={cn("flex gap-1.5", className)}>
        {stories.slice(0, VISIBLE_TILES).map((story, i) => {
          const Icon = STORY_ICONS[story.kind];
          return (
            <li key={story.id}>
              <button
                type="button"
                onClick={() => setOpenAt(i)}
                aria-label={t("open", { title: story.title })}
                className={cn(
                  TILE,
                  halo === i && "border-brand ring-2 ring-brand/30",
                )}
              >
                <Icon className="size-5" weight="bold" />
                {t(`tile.${story.kind}`)}
              </button>
            </li>
          );
        })}
        {hidden > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setOpenAt(VISIBLE_TILES)}
              aria-label={t("more", { count: hidden })}
              className={cn(
                TILE,
                "bg-muted text-base text-foreground normal-case",
                halo !== null &&
                  halo >= VISIBLE_TILES &&
                  "border-brand ring-2 ring-brand/30",
              )}
            >
              +{hidden}
            </button>
          </li>
        )}
      </ul>
      {openAt !== null && (
        <StoryViewer
          event={event}
          start={openAt}
          onSeen={markSeen}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
