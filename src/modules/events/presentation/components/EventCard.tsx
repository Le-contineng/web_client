import { ClockIcon, MapPinIcon } from "@/shared/components/icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type React from "react";
import {
  eventImage,
  eventImageLayout,
  feedImageRatio,
} from "@/modules/events/domain/event-image";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { EventBadges } from "@/modules/events/presentation/components/EventBadges";
import { InterestButton } from "@/modules/events/presentation/components/InterestButton";
import { DateTile } from "@/modules/events/presentation/components/DateTile";
import { EventTime } from "@/modules/events/presentation/components/EventTime";
import { PublicationDate } from "@/modules/events/presentation/components/PublicationDate";
import { ShareIconButton } from "@/modules/events/presentation/components/ShareButton";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { ProgressiveImage } from "@/shared/components/ProgressiveImage";
import { cn } from "@/shared/lib/utils";

export const DEFAULT_IMAGE = "/demo/defaut.svg";

/**
 * Carte d'événement du fil (US-01), sobre : qui publie et quand, l'affiche,
 * puis une ligne d'actions façon réseau social : la petite tuile de date
 * posée sur le coin de l'affiche (la signature du site) et, à droite, les
 * actions (Partager). Dessous, le nom, puis l'heure et le lieu, chacun avec
 * son icône pour être repéré d'un coup d'œil. Catégories et description sont
 * dans la fiche.
 *
 * L'affiche garde ses proportions entre 4:5 et 1,91:1 et ne dépasse jamais
 * 70 % de la hauteur de l'écran : une affiche très haute est recadrée au
 * centre ; la fiche complète la montre en entier.
 */
export function EventCard({
  event,
  priority = false,
  onOpen,
  onShare,
}: {
  event: EventView;
  priority?: boolean;
  /** Mesure des partages (US-36). */
  onShare?: (eventId: string) => Promise<void>;
  /**
   * Ouvre l'aperçu au lieu de naviguer, sur grand écran seulement. Le lien
   * vers /e/{id} reste en place : nouvel onglet (Ctrl/Cmd + clic, clic
   * molette) et, sur mobile, vraie page avec retour natif.
   */
  onOpen?: (eventId: string) => void;
}) {
  const t = useTranslations();
  const cancelled = event.status === "cancelled";
  const layout = eventImageLayout(event);
  const open = onOpen
    ? (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        // Sur mobile, le lien ouvre la vraie page : le retour du téléphone y ramène au fil
        if (opensAsPage()) return;
        e.preventDefault();
        onOpen(event.id);
      }
    : undefined;
  return (
    <article className="grid min-w-0 grid-cols-1 gap-2.5 border-b pb-6 sm:border-none sm:pb-0">
      {/* Avatar, puis le nom de la page et, dessous, la date de publication */}
      <header className="flex items-center gap-2.5 px-4 sm:px-0">
        {/* Doublon du lien du nom : caché aux lecteurs d'écran et au clavier */}
        <Link
          href={`/p/${event.organizer.slug}`}
          aria-hidden
          tabIndex={-1}
          className="shrink-0"
        >
          <ProfileAvatar
            name={event.organizer.name}
            photo={event.organizer.photoUrl}
            size="md"
          />
        </Link>
        <div className="grid min-w-0 leading-tight">
          <Link
            href={`/p/${event.organizer.slug}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            {event.organizer.name}
          </Link>
          <PublicationDate
            iso={event.createdAt}
            className="truncate text-xs text-muted-foreground"
          />
        </div>
      </header>

      <Link
        href={`/e/${event.id}`}
        onClick={open}
        className="block sm:overflow-hidden sm:rounded-lg"
        // Le nom accessible doit contenir le texte visible (WCAG 2.5.3) :
        // « Annulé » est écrit sur la photo d'un événement annulé.
        aria-label={
          cancelled ? `${t("statuses.cancelled")} : ${event.name}` : event.name
        }
      >
        <div
          className="relative max-h-[70svh] w-full bg-muted"
          style={{ aspectRatio: feedImageRatio(layout) }}
        >
          <ProgressiveImage
            src={eventImage(event)}
            fallbackSrc={eventImage({ ...event, photoUrl: null })}
            fill
            placeholder={layout?.placeholder}
            priority={priority}
            imageClassName={cn(cancelled && "opacity-60 grayscale")}
          />
          {cancelled && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="rounded-md bg-destructive px-3 py-1 text-sm font-semibold tracking-wide text-white uppercase">
                {t("statuses.cancelled")}
              </span>
            </span>
          )}
        </div>
      </Link>

      {/* Ligne d'actions : tuile posée sur le coin de l'affiche, actions à droite,
          alignées sur le bas de la tuile */}
      <div className="flex items-end justify-between gap-3 px-4 sm:px-0">
        <DateTile
          iso={event.startsAt}
          size="sm"
          className={cn(
            "relative -mt-8 shrink-0",
            // Grisée sans transparence : le texte de la tuile garde un
            // contraste suffisant (WCAG 1.4.3), ce qu'une opacité réduite casse.
            cancelled && "grayscale",
          )}
        />
        <div className="-mr-2 -mb-2 flex items-center">
          {!cancelled && event.period !== "past" && (
            <InterestButton event={event} />
          )}
          <ShareIconButton
            path={`/e/${event.id}`}
            title={event.name}
            text={event.name}
            onShare={onShare && (() => onShare(event.id))}
          />
        </div>
      </div>

      <div className="grid gap-1 px-4 sm:px-0">
        <h2
          className={cn(
            "truncate text-base leading-snug font-semibold",
            cancelled && "text-muted-foreground line-through",
          )}
        >
          <Link
            href={`/e/${event.id}`}
            onClick={open}
            className="hover:underline"
          >
            {event.name}
          </Link>
        </h2>
        {/* Le statut d'abord : c'est ici que l'on décide si l'on peut venir */}
        <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <EventBadges
            status={event.status}
            period={event.period}
            compact
            className="shrink-0 flex-nowrap empty:hidden"
          />
          <ClockIcon aria-hidden className="size-4 shrink-0" />
          <EventTime iso={event.startsAt} className="shrink-0" />
        </p>
        <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{event.location}</span>
        </p>
      </div>
    </article>
  );
}

/**
 * Écran étroit (sous `sm`, 640 px), où l'aperçu prendrait tout l'écran : la
 * fiche s'ouvre alors comme une page, pour que le bouton retour du téléphone
 * et le geste de retour fonctionnent comme partout ailleurs.
 */
export const PAGE_QUERY = "(max-width: 639.98px)";

function opensAsPage(): boolean {
  return (
    typeof window !== "undefined" && !!window.matchMedia?.(PAGE_QUERY).matches
  );
}

/** Dimensions et aperçu flou à passer à l'image, quand ils sont connus. */
export function layoutProps(event: EventView) {
  const layout = eventImageLayout(event);
  return layout
    ? {
        width: layout.width,
        height: layout.height,
        placeholder: layout.placeholder,
      }
    : {};
}
