"use client";

import {
  CalendarDotsIcon,
  MapPinIcon,
  ProhibitIcon,
} from "@/shared/components/icons";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { useMounted } from "@/shared/hooks/useMounted";
import { cn } from "@/shared/lib/utils";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { ExpandableText } from "@/shared/components/ExpandableText";

/**
 * Zones de la fiche d'un événement, communes à l'aperçu (panneau) et à la
 * fiche (/e/{id}). Les dates sont affichées à l'heure de l'appareil, donc
 * seulement une fois dans le navigateur (D7).
 */

/** L'organisateur sur une ligne, sous le titre. */
export function EventOrganizerLine({ event }: { event: EventView }) {
  const t = useTranslations("events.sheet");
  return (
    <Link
      href={`/p/${event.organizer.slug}`}
      className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <ProfileAvatar
        name={event.organizer.name}
        photo={event.organizer.photoUrl}
        size="xs"
      />
      <span>
        {t("by")}{" "}
        <span className="font-semibold text-foreground">
          {event.organizer.name}
        </span>
      </span>
    </Link>
  );
}

/** Ligne d'information : icône et texte (une action pourra s'y ajouter). */
function InfoRow({
  icon,
  tone,
  children,
  action,
}: {
  icon: ReactNode;
  tone: keyof typeof TONES;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg [&_svg]:size-5",
          TONES[tone],
        )}
      >
        {icon}
      </span>
      <span className="grid min-w-0 content-center gap-0.5">
        {children}
        {action}
      </span>
    </li>
  );
}

/**
 * Teinte de chaque type d'information, presque blanche en mode clair, pour
 * les repérer d'un coup d'œil : la date en bleu, le lieu en vert, les
 * catégories en violet.
 */
const TONES = {
  date: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  place:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  tag: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
};

/** Infos pratiques : quand et où. */
export function EventPracticalInfo({ event }: { event: EventView }) {
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
    <ul className="grid gap-4">
      <InfoRow icon={<CalendarDotsIcon />} tone="date">
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
            ? `${time(start)}${event.endsAt ? ` – ${time(new Date(event.endsAt))}` : ""} ${zone ?? ""}`
            : " "}
        </span>
      </InfoRow>
      <InfoRow icon={<MapPinIcon />} tone="place">
        <span className="font-medium break-words">{event.location}</span>
      </InfoRow>
    </ul>
  );
}

/** Alerte d'annulation, avec le motif. */
export function EventCancellation({ event }: { event: EventView }) {
  const t = useTranslations();
  if (event.status !== "cancelled" || !event.cancellation) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
    >
      <ProhibitIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
      <span>
        <span className="block font-semibold text-destructive">
          {t("statuses.cancelled")}
        </span>
        {event.cancellation.reason}
      </span>
    </div>
  );
}

/** « À propos » : la description repliée, puis les catégories cliquables. */
export function EventAbout({ event }: { event: EventView }) {
  const t = useTranslations();
  const description = event.description?.trim();
  if (!description && event.categories.length === 0) return null;
  return (
    <Section title={t("events.sheet.about")}>
      {description && <ExpandableText text={description} lines={4} />}
      {event.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {event.categories.map((c) => (
            <Link
              key={c}
              href={`/?category=${c}`}
              className={cn(
                "rounded-[4px] px-2 py-0.5 text-sm hover:underline",
                TONES.tag,
              )}
            >
              {t(`categories.${c}`)}
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}
