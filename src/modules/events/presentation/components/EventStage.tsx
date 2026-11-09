"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ImagesIcon,
  LinkSimpleIcon,
  XIcon,
} from "@/shared/components/icons";
import { MoreActions } from "@/shared/components/MoreActions";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { BottomSheet, BottomSheetTitle } from "@/shared/components/BottomSheet";
import {
  eventImage,
  withInheritedPhoto,
} from "@/modules/events/domain/event-image";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { EventBadges } from "@/modules/events/presentation/components/EventBadges";
import {
  EventAbout,
  EventCancellation,
  EventOrganizerLine,
  EventPracticalInfo,
} from "@/modules/events/presentation/components/EventInfo";
import { EventLatestUpdate } from "@/modules/events/presentation/components/EventLatestUpdate";
import { InterestButton } from "@/modules/events/presentation/components/InterestButton";
import { ShareIconButton } from "@/modules/events/presentation/components/ShareButton";
import { FollowButton } from "@/modules/pages";
import { PublicationDate } from "@/modules/events/presentation/components/PublicationDate";
import { SubEventOrigin } from "@/modules/events/presentation/components/SubEventLinks";

// Liens sans préchargement : la fiche défile en story, et chaque écran
// déclencherait sinon un rendu de la page liée, même sans clic.

/** Distance d'un glissement vers le haut qui ouvre le panneau, en pixels. */
export const SWIPE_MIN = 40;

/** Libellé blanc sous une action de la colonne, lisible sur toute photo. */
const LABEL =
  "text-xs font-semibold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]";
/** Action de la colonne : icône blanche, grande, ombrée. */
const RAIL =
  "text-white hover:bg-transparent [&_svg]:size-8 [&_svg]:drop-shadow-[0_1px_2px_rgb(0_0_0/0.5)]";

/**
 * Fiche d'un événement sur téléphone, en plein écran comme une vidéo de
 * TikTok : l'affiche remplit l'écran, les actions sont empilées à droite
 * (organisateur, intéressé, posts, partager, ···), et en bas, le moins de
 * texte possible : l'organisateur, puis le nom et le début de la
 * description sur une ligne. Un toucher
 * sur ce bas fait monter un panneau avec toutes les informations de la
 * fiche : infos pratiques, alertes, à propos, programme.
 */
export function EventStage({
  event: given,
  share,
  manage,
  views,
  programme,
  story,
  onOpenChange,
  className,
}: {
  event: EventView;
  /** Partage : adresse publique et mesure des clics (US-36). */
  share: { url: string; onShare?: () => Promise<void> };
  /** Modifier, Annuler… pour l'organisateur : dans le « ··· ». */
  manage?: ReactNode;
  /** Nombre de vues, réservé aux membres de la page. */
  views?: ReactNode;
  /** Programme d'un événement principal, en fin de panneau. */
  programme?: ReactNode;
  /**
   * Dans une story (ADR 0025) : fermeture à la place du retour, progression en
   * haut, zones de toucher posées sur l'affiche.
   */
  story?: { onClose: () => void; progress: ReactNode; touch: ReactNode };
  /** Ouverture et fermeture du panneau d'informations (la story s'y met en pause). */
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const event = withInheritedPhoto(given);
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Glisser vers le haut, n'importe où sur la fiche, ouvre le panneau
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  function changeOpen(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }
  const cancelled = event.status === "cancelled";
  const image = eventImage(event);
  const posts = event.posts?.count ?? 0;
  const description = event.description?.trim();

  function back() {
    const fromSite =
      document.referrer.startsWith(window.location.origin) &&
      window.history.length > 1;
    if (fromSite) router.back();
    else router.push("/");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(share.url);
    toast.success(t("events.sheet.linkCopied"));
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 touch-none overflow-hidden bg-black text-white",
        className,
      )}
      onPointerDown={(e) => {
        swipeStart.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = swipeStart.current;
        swipeStart.current = null;
        if (!start || open) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (dy < -SWIPE_MIN && Math.abs(dy) > Math.abs(dx)) changeOpen(true);
      }}
      onWheel={(e) => {
        if (e.deltaY > 0 && !open) changeOpen(true);
      }}
    >
      {/* L'affiche entre deux bandes noires, à ses propres proportions : toute
          la largeur, sa hauteur naturelle, centrée ; seule une affiche plus
          haute que l'espace est recadrée au centre */}
      <div className="absolute inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] bottom-[calc(6rem+env(safe-area-inset-bottom))] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- affiche plein écran */}
        <img
          src={image}
          alt=""
          draggable={false}
          className={cn(
            "h-auto max-h-full w-full object-cover select-none",
            cancelled && "grayscale",
          )}
        />
      </div>
      {/* Léger voile à droite : les actions blanches restent lisibles */}
      <div className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] right-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] w-24 bg-linear-to-l from-black/35 to-transparent" />

      {/* Zones de toucher de la story, sur l'affiche seulement : ni la colonne
          d'actions ni le bas ne les reçoivent */}
      {story && (
        <div className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] right-20 bottom-[calc(6rem+env(safe-area-inset-bottom))] left-0">
          {story.touch}
        </div>
      )}
      {/* Progression de la story, au-dessus de la barre du haut */}
      {story && (
        <div className="absolute inset-x-0 top-0 z-10 px-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
          {story.progress}
        </div>
      )}

      {story ? (
        // En-tête d'une story, comme celui d'une carte du fil : la page, la
        // date de publication, « Suivre », puis la fermeture à droite
        <div className="absolute inset-x-0 top-0 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center gap-2.5 pt-[calc(0.5rem+env(safe-area-inset-top))] pr-1 pl-3">
          <Link
            prefetch={false}
            href={`/p/${event.organizer.slug}`}
            className="flex min-w-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <ProfileAvatar
              name={event.organizer.name}
              photo={event.organizer.photoUrl}
              size="sm"
              className="shrink-0"
            />
            <span className="grid min-w-0 leading-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]">
              <span className="truncate text-sm font-semibold">
                {event.organizer.name}
              </span>
              <PublicationDate
                iso={event.createdAt}
                className="truncate text-xs text-white/75"
              />
            </span>
          </Link>
          <FollowButton
            slug={event.organizer.slug}
            following={
              event.viewer ? (event.viewer.followingOrganizer ?? false) : null
            }
            variant="card"
            className="bg-white/15 text-white hover:bg-white/25"
          />
          <button
            type="button"
            onClick={story.onClose}
            aria-label={t("stories.close")}
            className="ml-auto grid size-10 shrink-0 place-items-center rounded-full outline-none hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <XIcon className="size-6" />
          </button>
        </div>
      ) : (
        <div className="absolute inset-x-0 top-0 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center gap-2 px-3 pt-[env(safe-area-inset-top)]">
          <button
            type="button"
            onClick={back}
            aria-label={t("common.back")}
            className="grid size-10 shrink-0 place-items-center rounded-full outline-none hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <ArrowLeftIcon className="size-6" />
          </button>
          <EventBadges
            status={event.status}
            period={event.period}
            className="empty:hidden"
          />
          <div className="ml-auto">{views}</div>
        </div>
      )}

      {/* Les actions, empilées à droite */}
      <div className="absolute right-2 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-10 flex flex-col items-center gap-4">
        {!story && (
          <Link
            prefetch={false}
            href={`/p/${event.organizer.slug}`}
            aria-label={event.organizer.name}
            className="mb-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <ProfileAvatar
              name={event.organizer.name}
              photo={event.organizer.photoUrl}
              className="size-11 ring-2 ring-white"
            />
          </Link>
        )}
        {!cancelled && event.period !== "past" && (
          <InterestButton
            event={event}
            className={cn(
              RAIL,
              "h-auto flex-col gap-0.5 px-1 text-xs [text-shadow:0_1px_2px_rgb(0_0_0/0.6)] aria-pressed:text-brand",
            )}
          />
        )}
        {posts > 0 && (
          <Link
            prefetch={false}
            href={`/e/${event.id}/posts`}
            className="grid justify-items-center gap-0.5 outline-none focus-visible:ring-3 focus-visible:ring-white/60 [&_svg]:size-8 [&_svg]:drop-shadow-[0_1px_2px_rgb(0_0_0/0.5)]"
          >
            <ImagesIcon />
            <span className={LABEL}>{posts}</span>
          </Link>
        )}
        <ShareIconButton
          url={share.url}
          title={event.name}
          text={event.name}
          onShare={share.onShare}
          className={cn(RAIL, "size-auto")}
        />
        <MoreActions
          label={t("events.sheet.moreActions")}
          triggerClassName={cn(RAIL, "size-auto")}
        >
          <Button variant="ghost" onClick={copyLink}>
            <LinkSimpleIcon /> {t("events.sheet.copyLink")}
          </Button>
          {manage}
        </MoreActions>
      </div>

      {/* Le bas : nom, date, début de description ; un toucher ou un glissement
          vers le haut ouvre tout */}
      <button
        type="button"
        onClick={() => changeOpen(true)}
        aria-haspopup="dialog"
        className="absolute right-16 bottom-0 left-0 grid gap-1 pt-6 pr-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:ring-inset"
      >
        {/* Dans une story, la page est déjà dans l'en-tête */}
        {story ? (
          <span className="text-[15px] font-bold">{event.name}</span>
        ) : (
          <span className="text-[15px] font-bold">{event.organizer.name}</span>
        )}
        {story ? (
          description && (
            <span className="line-clamp-1 text-sm leading-snug text-white/75">
              {description}
            </span>
          )
        ) : (
          <span
            className={cn(
              "line-clamp-1 text-sm leading-snug",
              cancelled && "line-through",
            )}
          >
            {event.name}
            {description && (
              <span className="text-white/75"> · {description}</span>
            )}
          </span>
        )}
        <span className="text-sm font-semibold text-white/90">
          {t("events.stage.more")}
        </span>
      </button>

      {/* Toutes les informations de la fiche, dans un panneau qui monte du bas
          et s'étend quand on le pousse vers le haut */}
      <BottomSheet open={open} onOpenChange={changeOpen}>
        <div className="grid gap-6 px-5 pt-2">
          <header className="grid gap-1">
            <BottomSheetTitle
              className={cn(
                "text-xl leading-tight font-semibold",
                cancelled && "text-muted-foreground line-through",
              )}
            >
              {event.name}
            </BottomSheetTitle>
            <EventOrganizerLine event={event} />
            {event.parent && (
              <SubEventOrigin
                parent={event.parent}
                categories={event.categories}
              />
            )}
          </header>
          {(cancelled ||
            (event.status === "updated" && event.latestUpdate)) && (
            <div className="grid gap-3">
              <EventCancellation event={event} />
              {event.status === "updated" && event.latestUpdate && (
                <EventLatestUpdate
                  at={event.latestUpdate.at}
                  changes={event.latestUpdate.changes}
                />
              )}
            </div>
          )}
          <EventPracticalInfo event={event} />
          <div className="grid empty:hidden">
            <EventAbout event={event} />
          </div>
          {programme}
        </div>
      </BottomSheet>
    </div>
  );
}
