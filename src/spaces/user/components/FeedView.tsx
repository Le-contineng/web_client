import { CalendarXIcon } from "@/shared/components/icons";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/modules/authentication/server";
import {
  FilterBar,
  isDefault,
  EventFeed,
  readUrlFilters,
} from "@/modules/events";
import {
  trackEventViewAction,
  trackShareClickAction,
} from "@/modules/audience/application/audience.actions";
import { loadEventsAction } from "@/modules/events/application/events.actions";
import { listEventsFromUrl, getFilterPages } from "@/modules/events/server";
import { CampaignCard } from "@/modules/campaigns";
import { trackCampaignAction } from "@/modules/campaigns/application/campaigns.actions";
import { getActiveCampaigns } from "@/modules/campaigns/server";
import { PageSuggestions } from "@/modules/pages";
import { getMyFollows, getPageSuggestions } from "@/modules/pages/server";
import { cn } from "@/shared/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Fil d'actualité (US-01, US-16, US-17), commun à l'accueil (`/`, tous les
 * événements, sans compte) et à l'onglet « Abonnements » (`/following`, les
 * pages suivies seulement, ADR 0019). Le fil général ne change pas ; l'onglet
 * demande la même liste à l'API, filtrée par les pages suivies. Vide, il
 * propose des pages à suivre.
 */
export async function FeedView({
  searchParams,
  followed = false,
}: {
  searchParams: SearchParams;
  followed?: boolean;
}) {
  const account = await getCurrentAccount();
  if (followed && !account) redirect("/login?returnTo=%2Ffollowing");
  const t = await getTranslations();
  const filters = { ...readUrlFilters(searchParams), followed };
  const [{ events, nextOffset, asOf }, pages, campaigns] = await Promise.all([
    listEventsFromUrl(filters),
    getFilterPages(),
    followed ? null : getActiveCampaigns(),
  ]);

  const topCampaign =
    campaigns && isDefault(filters) ? campaigns.FEED_TOP : undefined;

  // Sur ordinateur, le fil est décalé vers la gauche du centre (10rem),
  // sans coller à la barre latérale.
  return (
    <div className="mx-auto grid max-w-[470px] gap-4 pt-4 sm:px-4 md:pt-8 lg:mr-auto lg:ml-[max(2rem,calc(50%-235px-10rem))]">
      <h1 className="sr-only">
        {followed ? t("events.feedTabs.following") : t("events.listTitle")}
      </h1>
      <div className="grid gap-4 px-4 sm:px-0">
        {account && (
          <nav
            className="flex gap-6 border-b"
            aria-label={t("events.listTitle")}
          >
            <FeedTab href="/" active={!followed}>
              {t("events.feedTabs.all")}
            </FeedTab>
            <FeedTab href="/following" active={followed}>
              {t("events.feedTabs.following")}
            </FeedTab>
          </nav>
        )}
        <FilterBar filters={filters} pages={pages} />
      </div>
      {/* Mise en avant hors du fil, en tête et seulement sans filtre */}
      {topCampaign && (
        <CampaignCard campaign={topCampaign} track={trackCampaignAction} />
      )}
      {events.length === 0 ? (
        followed && isDefault(filters) ? (
          <EmptySubscriptions />
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-20 text-center text-muted-foreground">
            <CalendarXIcon className="size-10" />
            <p>
              {isDefault(filters)
                ? t("events.noUpcoming")
                : t("events.noMatch")}
            </p>
          </div>
        )
      ) : (
        <EventFeed
          // La clé réinitialise le fil quand les filtres changent.
          key={JSON.stringify(filters)}
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

function FeedTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mb-px border-b-2 pb-2 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

/** Onglet « Abonnements » vide : pourquoi, puis des pages à suivre. */
async function EmptySubscriptions() {
  const t = await getTranslations("pages.follow");
  const [follows, suggestions] = await Promise.all([
    getMyFollows(),
    getPageSuggestions(),
  ]);
  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-center gap-3 px-4 pt-10 text-center text-muted-foreground">
        <CalendarXIcon className="size-10" />
        <p>{follows.length ? t("nothingPlanned") : t("noneYet")}</p>
      </div>
      <PageSuggestions pages={suggestions} />
    </div>
  );
}
