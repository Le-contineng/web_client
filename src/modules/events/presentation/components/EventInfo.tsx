"use client";

import {
  BanIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  MapPinIcon,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { cn } from "@/shared/lib/utils";
import { useMounted } from "@/shared/hooks/useMounted";
import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { DateTile } from "@/modules/events/presentation/components/DateTile";

/**
 * Blocs d'information d'un événement, communs à l'aperçu (panneau) et à la
 * fiche (/e/{id}). Les dates sont affichées à l'heure de l'appareil, donc
 * seulement une fois dans le navigateur (D7).
 */

/** Lien Google Maps du lieu d'un événement. */
function mapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

/** Date (tuile + jour + horaire) et lieu, l'un sous l'autre ; lien Maps en option. */
export function EventWhenWhere({
  event,
  maps = false,
}: {
  event: EventView;
  maps?: boolean;
}) {
  const t = useTranslations("events.sheet");
  const format = useFormatter();
  const locale = useLocale();
  const mounted = useMounted();
  const start = new Date(event.startsAt);
  const time = (d: Date) =>
    format.dateTime(d, { hour: "2-digit", minute: "2-digit" });
  // Décalage horaire de l'appareil (« UTC+2 »), comme l'heure affichée.
  const zone = new Intl.DateTimeFormat(locale, { timeZoneName: "shortOffset" })
    .formatToParts(start)
    .find((p) => p.type === "timeZoneName")?.value;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <DateTile
          iso={event.startsAt}
          className="w-11 shrink-0 rounded-[14px] text-xs"
        />
        <div className="grid">
          <span className="font-medium first-letter:uppercase">
            {mounted
              ? format.dateTime(start, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : " "}
          </span>
          <span className="text-sm text-muted-foreground">
            {mounted
              ? `${time(start)}${event.endsAt ? ` - ${time(new Date(event.endsAt))}` : ""} ${zone ?? ""}`
              : " "}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-muted">
          <MapPinIcon className="size-5 text-muted-foreground" />
        </span>
        <span className="min-w-0 flex-1 font-medium">{event.location}</span>
        {maps && (
          <a
            href={mapsUrl(event.location)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "secondary",
              size: "pill",
              className: "shrink-0 px-4 text-sm",
            })}
          >
            {t("openMaps")} <ExternalLinkIcon />
          </a>
        )}
      </div>
    </div>
  );
}

/** Encadré d'annulation, avec le motif. */
export function EventCancellation({ event }: { event: EventView }) {
  const t = useTranslations();
  if (event.status !== "cancelled" || !event.cancellation) return null;
  return (
    <div role="status" className="grid gap-1 overflow-hidden rounded-xl border">
      <p className="bg-muted px-4 py-2 text-sm text-muted-foreground">
        {t("statuses.cancelled")}
      </p>
      <p className="flex items-start gap-2 px-4 pt-2 pb-4 text-sm">
        <BanIcon className="mt-0.5 size-4 shrink-0" />
        <span>
          <span className="text-muted-foreground">{t("events.reason")} </span>
          {event.cancellation.reason}
        </span>
      </p>
    </div>
  );
}

/** « À propos » : description et, en option, catégories. */
export function EventAbout({
  event,
  showCategories = true,
}: {
  event: EventView;
  /** La fiche affiche les catégories sur la photo. */
  showCategories?: boolean;
}) {
  const t = useTranslations();
  return (
    <InfoSection title={t("events.sheet.about")}>
      {event.description && (
        <p className="leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      )}
      {showCategories && (
        <div className="flex flex-wrap gap-1.5">
          {event.categories.map((c) => (
            <Badge key={c} variant="secondary">
              {t(`categories.${c}`)}
            </Badge>
          ))}
        </div>
      )}
    </InfoSection>
  );
}

/** « À propos » (description, catégories) et « Lieu » (avec lien Maps). */
export function EventAboutAndPlace({ event }: { event: EventView }) {
  const t = useTranslations();
  return (
    <>
      <EventAbout event={event} />
      <InfoSection title={t("events.location")}>
        <p>{event.location}</p>
        <a
          href={mapsUrl(event.location)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "justify-self-start",
          })}
        >
          {t("events.sheet.openMaps")} <ExternalLinkIcon />
        </a>
      </InfoSection>
    </>
  );
}

/** « Présenté par » : la page organisatrice, avec un lien vers elle. */
export function EventPresenter({ event }: { event: EventView }) {
  const t = useTranslations("events.sheet");
  return (
    <InfoSection title={t("presentedBy")}>
      <Link
        href={`/p/${event.organizer.slug}`}
        className="-m-2 flex items-center gap-3 rounded-2xl p-2 hover:bg-muted"
      >
        <ProfileAvatar
          name={event.organizer.name}
          photo={event.organizer.photoUrl}
          size="md"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">
            {event.organizer.name}
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            @{event.organizer.slug}
          </span>
        </span>
        <ChevronRightIcon className="size-5 text-muted-foreground" />
      </Link>
    </InfoSection>
  );
}

/** Carte opaque d'une fiche : fond blanc, rayon 22, ombre douce. */
export function InfoCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-card bg-card p-4 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="border-b pb-2 text-sm font-medium text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
