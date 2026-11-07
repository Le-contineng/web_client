"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";
import { hasNewPosts } from "@/modules/events/domain/event-post";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { useLastSeenPosts } from "@/modules/events/presentation/components/useLastSeenPosts";
import { ImagesIcon } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";

/**
 * Tuile « Posts » (ADR 0023), petit papier à côté de la tuile de date : elle
 * ouvre le fil de l'événement. Tant qu'il y a du nouveau depuis la dernière
 * visite, elle porte un petit point fuchsia et s'anime doucement (halo)
 * pour se faire remarquer, sans se remplir de fuchsia.
 */
export function PostTile({
  event,
  className,
}: {
  event: Pick<EventView, "id" | "posts">;
  className?: string;
}) {
  const t = useTranslations("posts");
  const { lastSeenAt } = useLastSeenPosts(event.id);
  const count = event.posts?.count ?? 0;
  if (count === 0) return null;
  const fresh = hasNewPosts(event.posts, lastSeenAt);

  return (
    <Link
      href={`/e/${event.id}/posts`}
      aria-label={`${t("tileLabel", { count })}${fresh ? ` · ${t("new")}` : ""}`}
      className={cn(
        "relative grid w-12 place-items-center content-center gap-1 rounded-[4px] border px-1 py-1.5 text-[9px] font-bold tracking-wide uppercase shadow-xs transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
        // Papier blanc et encre, comme le jour de la tuile de date : sur la
        // carte, le fuchsia reste à la bande du mois
        "bg-card text-foreground",
        fresh && "motion-safe:animate-beckon",
        className,
      )}
    >
      {/* Duotone : un trait et une face teintée, comme le papier plié de la charte */}
      <ImagesIcon className="size-5" weight="duotone" />
      {t("tile")}
      {/* Du nouveau : un petit point fuchsia dans le coin, pas de remplissage */}
      {fresh && (
        <span
          aria-hidden
          className="absolute -top-1 -left-1 size-2.5 rounded-full bg-brand ring-2 ring-background"
        />
      )}
      <span
        aria-hidden
        className={cn(
          "absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full border-2 border-background px-1 text-[10px] font-bold tabular-nums",
          fresh ? "bg-ink text-ink-foreground" : "bg-muted text-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

/** Marque le fil comme vu à l'ouverture : la tuile cesse de s'animer. */
export function MarkPostsSeen({
  eventId,
  latestAt,
}: {
  eventId: string;
  latestAt: string | null;
}) {
  const { markSeen } = useLastSeenPosts(eventId);
  useEffect(() => {
    if (latestAt) markSeen(latestAt);
  }, [latestAt, markSeen]);
  return null;
}
