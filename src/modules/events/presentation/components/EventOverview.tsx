"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { LinkSimpleIcon } from "@/shared/components/icons";
import { MoreActions } from "@/shared/components/MoreActions";
import { ProgressiveImage } from "@/shared/components/ProgressiveImage";
import { useNow } from "@/shared/hooks/useNow";
import { cn } from "@/shared/lib/utils";
import { SubEventFamily } from "@/modules/events/presentation/components/SubEventLinks";
import { Button } from "@/shared/ui/button";
import {
  eventImage,
  withInheritedPhoto,
} from "@/modules/events/domain/event-image";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { EventBadges } from "@/modules/events/presentation/components/EventBadges";
import { layoutProps } from "@/modules/events/presentation/components/EventCard";
import {
  EventAbout,
  EventCancellation,
  EventOrganizerLine,
  EventPracticalInfo,
} from "@/modules/events/presentation/components/EventInfo";
import { EventLatestUpdate } from "@/modules/events/presentation/components/EventLatestUpdate";
import { InterestButton } from "@/modules/events/presentation/components/InterestButton";
import { ShareIconButton } from "@/modules/events/presentation/components/ShareButton";

type TitleProps = { className: string; children: ReactNode };

/**
 * Fiche d'un événement en zones stables, comme une publication de réseau
 * social ouverte. Chaque zone a un rôle fixe et ne s'affiche que si elle a
 * du contenu ; une fonctionnalité future (« J'y vais », commentaires…)
 * remplit une zone existante sans refaire la mise en page.
 *
 * 1. Héros : la photo bord à bord, de hauteur bornée, l'état posé en haut ; en bas, sur un
 *    léger dégradé noir et en blanc, les statistiques (vues, réservées aux
 *    membres de la page) et les actions (intéressé, partager, ···).
 * 2. Identité : le titre et, juste dessous, l'organisateur.
 * 3. Alertes : annulation, dernière modification.
 * 4. Infos pratiques : quand et où.
 * 5. À propos : la description repliée, les catégories.
 *
 * `layout="page"` : sur ordinateur, la photo reste à gauche pendant que la
 * colonne de droite défile.
 */
export function EventOverview({
  event: given,
  layout = "sheet",
  title = (props) => <h1 {...props} />,
  share,
  manage,
  views,
}: {
  event: EventView;
  layout?: "sheet" | "page";
  /** Élément du titre (le panneau utilise le titre de sa boîte de dialogue). */
  title?: (props: TitleProps) => ReactNode;
  /** Partage : adresse publique et mesure des clics (US-36). */
  share: { url: string; onShare?: () => Promise<void> };
  /** Modifier, Annuler… pour l'organisateur : dans le « ··· ». */
  manage?: ReactNode;
  /** Nombre de vues, réservé aux membres de la page. */
  views?: ReactNode;
}) {
  // Sans affiche, un sous-événement montre celle de son principal
  const event = withInheritedPhoto(given);
  const t = useTranslations("events.sheet");
  const cancelled = event.status === "cancelled";
  const page = layout === "page";
  const text = cn(page ? "px-4 md:col-start-2 md:px-0" : "px-6");

  async function copyLink() {
    await navigator.clipboard.writeText(share.url);
    toast.success(t("linkCopied"));
  }

  return (
    <>
      <article
        className={cn(
          "grid grid-cols-1 content-start gap-6",
          page
            ? "mx-auto max-w-[1000px] md:grid-cols-[400px_minmax(0,1fr)] md:gap-x-10"
            : "pb-10",
        )}
      >
        {/* 1. Héros */}
        <div
          className={cn(
            "grid",
            page &&
              "md:sticky md:top-8 md:col-start-1 md:row-span-4 md:row-start-1 md:self-start",
          )}
        >
          <div className="relative overflow-hidden bg-muted">
            {/* Hauteur bornée : au-delà, l'image est recadrée au centre */}
            <ProgressiveImage
              src={eventImage(event)}
              {...layoutProps(event)}
              // Photo cassée : l'image par défaut de la catégorie
              fallbackSrc={eventImage({ ...event, photoUrl: null })}
              priority
              className={cn(
                "w-full",
                // Dimensions inconnues : place réservée en 4:5, jamais écrasée
                !event.photo && "aspect-[4/5]",
                page ? "max-h-[65svh] md:max-h-[560px]" : "max-h-[420px]",
              )}
              imageClassName={cn(
                !event.photo && "h-full",
                cancelled && "grayscale",
              )}
            />
            <HeroBadges event={event} />
            {/* Sur le bas de l'image, en blanc : les statistiques (vues, réservées
                aux membres de la page) à gauche, les actions à droite ; un
                dégradé noir garde le blanc lisible sur toute photo */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/60 via-black/25 to-transparent p-3 pt-12 text-white">
              <div className="min-w-0">{views}</div>
              <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-black/30 p-1 backdrop-blur-sm">
                {!cancelled && event.period !== "past" && (
                  <InterestButton event={event} className="hover:bg-white/15" />
                )}
                <ShareIconButton
                  url={share.url}
                  title={event.name}
                  text={event.name}
                  onShare={share.onShare}
                  className="hover:bg-white/15"
                />
                <MoreActions
                  label={t("moreActions")}
                  triggerClassName="hover:bg-white/15"
                >
                  <Button variant="ghost" onClick={copyLink}>
                    <LinkSimpleIcon /> {t("copyLink")}
                  </Button>
                  {manage}
                </MoreActions>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Identité */}
        <header className={cn("grid gap-1", text)}>
          {/* Titre et organisateur l'un sous l'autre, presque collés */}
          {title({
            className: cn(
              "leading-tight font-semibold break-words",
              page ? "text-2xl md:text-3xl" : "text-xl",
              cancelled && "text-muted-foreground line-through",
            ),
            children: event.name,
          })}
          <EventOrganizerLine event={event} />
          {/* Sous-événement : l'événement principal dont il fait partie */}
          {event.parent && <SubEventFamily parent={event.parent} />}
        </header>

        {/* 3. Alertes */}
        {(cancelled || (event.status === "updated" && event.latestUpdate)) && (
          <div className={cn("grid gap-3", text)}>
            <EventCancellation event={event} />
            {event.status === "updated" && event.latestUpdate && (
              <EventLatestUpdate
                at={event.latestUpdate.at}
                changes={event.latestUpdate.changes}
              />
            )}
          </div>
        )}

        {/* 4. Infos pratiques */}
        <div className={text}>
          <EventPracticalInfo event={event} />
        </div>

        {/* 5. À propos */}
        <div className={cn("grid empty:hidden", text)}>
          <EventAbout event={event} />
        </div>
      </article>
    </>
  );
}

/** État posé sur la photo : statut, période, ou « dans 3 heures » s'il commence bientôt. */
function HeroBadges({ event }: { event: EventView }) {
  const format = useFormatter();
  const now = useNow();
  const startsAt = Date.parse(event.startsAt);
  const soon =
    now !== null &&
    event.status !== "cancelled" &&
    event.period === "upcoming" &&
    startsAt - now < 24 * 60 * 60 * 1000;
  return (
    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
      <EventBadges
        status={event.status}
        period={event.period}
        className="empty:hidden [&>*]:shadow-sm"
      />
      {soon && (
        <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm first-letter:uppercase">
          {format.relativeTime(startsAt, now)}
        </span>
      )}
    </div>
  );
}
