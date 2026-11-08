"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ImagesIcon,
  LinkSimpleIcon,
} from "@/shared/components/icons";
import { MoreActions } from "@/shared/components/MoreActions";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/sheet";
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
import { SubEventOrigin } from "@/modules/events/presentation/components/SubEventLinks";

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
  className?: string;
}) {
  const event = withInheritedPhoto(given);
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
        "fixed inset-0 z-40 overflow-hidden bg-black text-white",
        className,
      )}
    >
      {/* L'affiche entre deux bandes noires, à ses propres proportions : toute
          la largeur, sa hauteur naturelle, centrée ; seule une affiche plus
          haute que l'espace est recadrée au centre */}
      <div className="absolute inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] bottom-[calc(6rem+env(safe-area-inset-bottom))] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- affiche plein écran */}
        <img
          src={image}
          alt=""
          className={cn(
            "h-auto max-h-full w-full object-cover",
            cancelled && "grayscale",
          )}
        />
      </div>
      {/* Léger voile à droite : les actions blanches restent lisibles */}
      <div className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] right-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] w-24 bg-linear-to-l from-black/35 to-transparent" />

      {/* Retour et état, en haut */}
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

      {/* Les actions, empilées à droite */}
      <div className="absolute right-2 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-10 flex flex-col items-center gap-4">
        <Link
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

      {/* Le bas : nom, date, début de description ; un toucher ouvre tout */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="absolute right-16 bottom-0 left-0 grid gap-1 pt-6 pr-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:ring-inset"
      >
        <span className="text-[15px] font-bold">{event.organizer.name}</span>
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
        <span className="text-sm font-semibold text-white/90">
          {t("events.stage.more")}
        </span>
      </button>

      {/* Toutes les informations de la fiche, dans un panneau qui monte du bas */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85svh] gap-0 overflow-y-auto rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <span
            aria-hidden
            className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30"
          />
          <div className="grid gap-6 px-5 pt-3">
            <header className="grid gap-1 pr-8">
              <SheetTitle
                className={cn(
                  "text-xl leading-tight font-semibold",
                  cancelled && "text-muted-foreground line-through",
                )}
              >
                {event.name}
              </SheetTitle>
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
