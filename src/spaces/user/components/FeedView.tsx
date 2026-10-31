import { CalendarXIcon } from "@/shared/components/icons";
import { getTranslations } from "next-intl/server";
import { EventFeed, readUrlFilters } from "@/modules/events";
import {
  trackEventViewAction,
  trackShareClickAction,
} from "@/modules/audience/application/audience.actions";
import { loadEventsAction } from "@/modules/events/application/events.actions";
import { listEventsFromUrl } from "@/modules/events/server";
import { CampaignCard } from "@/modules/campaigns";
import { trackCampaignAction } from "@/modules/campaigns/application/campaigns.actions";
import { getActiveCampaigns } from "@/modules/campaigns/server";

/**
 * Fil d'actualité de l'accueil (US-01, US-16) : tous les événements,
 * le même pour tous, avec ou sans compte. Suivre une page sert aux
 * notifications et aux statistiques, pas à un fil à part.
 */
export async function FeedView() {
  const t = await getTranslations();
  // Pas de filtre sur le fil : ils sont sur la recherche (/search).
  const filters = readUrlFilters({});
  const [{ events, nextOffset, asOf }, campaigns] = await Promise.all([
    listEventsFromUrl(filters),
    getActiveCampaigns(),
  ]);

  const topCampaign = campaigns.FEED_TOP;

  // Sur ordinateur, le fil est décalé vers la gauche du centre (10rem),
  // sans coller à la barre latérale.
  return (
    <div className="mx-auto grid max-w-[470px] gap-4 pt-4 sm:px-4 md:pt-8 lg:mr-auto lg:ml-[max(2rem,calc(50%-235px-10rem))]">
      <h1 className="sr-only">{t("events.listTitle")}</h1>
      {/* Mise en avant hors du fil, en tête */}
      {topCampaign && (
        <CampaignCard campaign={topCampaign} track={trackCampaignAction} />
      )}
      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center text-muted-foreground">
          <CalendarXIcon className="size-10" />
          <p>{t("events.noUpcoming")}</p>
        </div>
      ) : (
        <EventFeed
          initialEvents={events}
          initialNext={nextOffset}
          asOf={asOf}
          filters={filters}
          load={loadEventsAction}
          onView={trackEventViewAction}
          onShare={trackShareClickAction}
          firstImagePriority={!topCampaign}
        />
      )}
    </div>
  );
}
