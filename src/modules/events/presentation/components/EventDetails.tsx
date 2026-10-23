"use client";

import { AlertTriangleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { eventImage } from "@/modules/events/domain/event-image";
import { ProgressiveImage } from "@/shared/components/ProgressiveImage";
import { layoutProps } from "@/modules/events/presentation/components/EventCard";
import type { EventView } from "@/modules/events/domain/event-view.types";
import type { TrackedChange } from "@/modules/events/domain/event";
import { EventBadges } from "@/modules/events/presentation/components/EventBadges";
import { EventDate } from "@/modules/events/presentation/components/EventDate";
import {
  EventAbout,
  EventCancellation,
  EventPresenter,
  EventWhenWhere,
  InfoCard,
} from "@/modules/events/presentation/components/EventInfo";
import { CategoryChips } from "@/modules/events/presentation/components/CategoryChips";
import { EventHeroBar } from "@/modules/events/presentation/components/EventHeroBar";

/**
 * Fiche d'un événement (US-01). Sur téléphone : photo pleine largeur sous la
 * barre d'état, avec deux cercles de verre (retour, partage), puis le contenu
 * en cartes opaques (Présenté par, titre et statut, date et lieu, actions,
 * À propos). Sur ordinateur : la photo et la page organisatrice à gauche
 * (330 px), le reste à droite. Les actions et les vues dépendent des droits.
 */
export function EventDetails({
  event,
  actions,
  views,
  onShare,
}: {
  event: EventView;
  actions: ReactNode;
  views?: ReactNode;
  /** Mesure du clic sur « Partager » (cercle de la photo). */
  onShare?: () => Promise<void>;
}) {
  const t = useTranslations();
  const cancelled = event.status === "cancelled";
  const hero = useRef<HTMLDivElement>(null);
  return (
    <div className="mx-auto grid max-w-[960px] gap-3 px-3 md:grid-cols-[330px_minmax(0,1fr)] md:gap-x-10 md:gap-y-6 md:px-4">
      <EventHeroBar
        hero={hero}
        path={`/e/${event.id}`}
        title={event.name}
        onShare={onShare}
      />
      {/* Sur téléphone, la colonne s'efface : ses blocs s'intercalent (order). */}
      <aside className="contents md:grid md:content-start md:gap-6">
        <div
          ref={hero}
          className="relative -mx-3 overflow-hidden bg-muted md:mx-0 md:rounded-media"
        >
          {/* Toute la largeur, place réservée aux proportions de la photo */}
          <ProgressiveImage
            src={eventImage(event)}
            {...layoutProps(event)}
            priority
            imageClassName={cn(cancelled && "grayscale")}
          />
          <CategoryChips
            categories={event.categories}
            className="absolute inset-x-3 bottom-3 md:top-3 md:bottom-auto"
          />
        </div>
        <InfoCard className="order-1 md:order-none">
          <EventPresenter event={event} />
        </InfoCard>
        {views && <div className="order-6 md:order-none">{views}</div>}
      </aside>

      <div className="contents md:grid md:content-start md:gap-4">
        <InfoCard className="order-2 gap-3 md:order-none">
          <h1
            className={cn(
              "text-3xl leading-tight font-bold md:text-4xl",
              cancelled && "text-muted-foreground line-through",
            )}
          >
            {event.name}
          </h1>
          <EventBadges status={event.status} period={event.period} />
        </InfoCard>
        <InfoCard className="order-3 md:order-none">
          <EventWhenWhere event={event} maps />
        </InfoCard>
        <div className="order-3 empty:hidden md:order-none">
          <EventCancellation event={event} />
        </div>
        {event.status === "updated" && event.latestUpdate && (
          <div className="order-3 md:order-none">
            <LatestUpdate
              at={event.latestUpdate.at}
              changes={event.latestUpdate.changes}
            />
          </div>
        )}
        <InfoCard className="order-4 gap-3 md:order-none">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("events.sheet.actions")}
          </h2>
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </InfoCard>
        <InfoCard className="order-5 md:order-none">
          <EventAbout event={event} showCategories={false} />
        </InfoCard>
      </div>
    </div>
  );
}

/** Ancienne et nouvelle valeur de chaque champ changé lors de la dernière modification (US-15). */
function LatestUpdate({
  at,
  changes,
}: {
  at: string;
  changes: TrackedChange[];
}) {
  const t = useTranslations("events");
  const value = (c: TrackedChange, v: string | null) =>
    v === null ? (
      t("noEnd")
    ) : c.field === "location" ? (
      v
    ) : (
      <EventDate iso={v} className="first-letter:uppercase" />
    );
  return (
    <section className="grid gap-2 rounded-card border border-avertissement/40 bg-avertissement-fond p-4 text-sm">
      <p className="flex items-center gap-2 font-semibold text-avertissement">
        <AlertTriangleIcon className="size-4" />
        <span>
          {t("latestUpdate")} <EventDate iso={at} />
        </span>
      </p>
      <table className="w-full text-left">
        <thead className="text-xs text-muted-foreground">
          <tr>
            <th className="py-1 pr-2 font-normal" />
            <th className="py-1 pr-2 font-normal">{t("before")}</th>
            <th className="py-1 font-normal">{t("after")}</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr key={c.field} className="align-top">
              <th className="py-1 pr-2 font-medium">
                {t(`changedFields.${c.field}`)}
              </th>
              <td className="py-1 pr-2 text-muted-foreground line-through">
                {value(c, c.before)}
              </td>
              <td className="py-1 font-medium">{value(c, c.after)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
