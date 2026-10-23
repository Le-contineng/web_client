import {
  eventImage,
  eventImageLayout,
} from "@/modules/events/domain/event-image";
import { ProgressiveImage } from "@/shared/components/ProgressiveImage";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { cn } from "@/shared/lib/utils";
import { MapPinIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type React from "react";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { EventBadges } from "@/modules/events/presentation/components/EventBadges";
import { ShareIconButton } from "@/modules/events/presentation/components/ShareButton";
import { EventDate } from "@/modules/events/presentation/components/EventDate";
import { PublicationDate } from "@/modules/events/presentation/components/PublicationDate";
import { DateTile } from "@/modules/events/presentation/components/DateTile";
import { CategoryChips } from "@/modules/events/presentation/components/CategoryChips";

export const DEFAULT_IMAGE = "/demo/defaut.svg";

/**
 * Carte d'événement façon publication Instagram (US-01), opaque : en-tête avec
 * la page et la date de publication, grande image avec les catégories et la
 * tuile de date en verre posées dessus, puis nom, date et heure, lieu et
 * partage. Aucun flou sur la carte elle-même (performance du fil).
 */
export function EventCard({
  event,
  priority = false,
  onShare,
  onOpen,
}: {
  event: EventView;
  priority?: boolean;
  /**
   * Ouvre l'aperçu au lieu de naviguer. Le lien vers /e/{id} reste en place
   * pour l'ouverture dans un nouvel onglet (Ctrl/Cmd + clic, clic molette).
   */
  onOpen?: (eventId: string) => void;
  /** Mesure du clic sur « Partager », fournie par la route (métrique Viralité). */
  onShare?: (eventId: string) => Promise<void>;
}) {
  const t = useTranslations();
  const annule = event.status === "cancelled";
  const open = onOpen
    ? (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(event.id);
      }
    : undefined;
  return (
    <article className="rounded-card bg-card p-3 text-card-foreground shadow-card">
      <header className="flex items-center gap-3 pb-2.5">
        <Link
          href={`/p/${event.organizer.slug}`}
          className="flex min-w-0 items-center gap-2.5"
        >
          <ProfileAvatar
            name={event.organizer.name}
            photo={event.organizer.photoUrl}
            size="md"
          />
          <span className="grid min-w-0">
            <span className="truncate text-sm font-semibold">
              {event.organizer.name}
            </span>
            <PublicationDate
              iso={event.createdAt}
              className="text-xs text-muted-foreground"
            />
          </span>
        </Link>
        <EventBadges
          status={event.status}
          period={event.period}
          className="ml-auto justify-end"
        />
      </header>

      {/* Image opaque ; catégories et date en verre posées dessus. */}
      <div className="relative overflow-hidden rounded-media bg-muted">
        <Link
          href={`/e/${event.id}`}
          onClick={open}
          className="group block"
          aria-label={event.name}
        >
          {/* Largeur du fil, place réservée aux proportions de la photo */}
          <ProgressiveImage
            src={eventImage(event)}
            {...layoutProps(event)}
            priority={priority}
            imageClassName={cn(
              "transition-transform duration-500 group-hover:scale-[1.02]",
              annule && "grayscale",
            )}
          />
          {annule && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-6 bg-ct-red py-2 text-center text-lg font-bold tracking-widest text-white uppercase">
              {t("statuses.cancelled")}
            </span>
          )}
        </Link>
        <CategoryChips
          categories={event.categories}
          className="pointer-events-none absolute inset-x-2.5 top-2.5"
        />
        <DateTile
          iso={event.startsAt}
          glass
          className="pointer-events-none absolute bottom-2.5 left-2.5"
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 pt-3">
        <div className="grid gap-1">
          <h2
            className={cn(
              "text-xl leading-snug font-bold",
              annule && "text-muted-foreground line-through",
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
          <EventDate
            iso={event.startsAt}
            className="text-sm first-letter:uppercase"
          />
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        </div>
        <ShareIconButton
          path={`/e/${event.id}`}
          title={event.name}
          text={event.name}
          onShare={onShare ? () => onShare(event.id) : undefined}
          className="-mt-1 -mr-1"
        />
      </div>
    </article>
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
