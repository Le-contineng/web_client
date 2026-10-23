import { CalendarXIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
import { Suspense } from "react";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

/** Accueil = liste publique des événements, sans compte (US-01, US-16, US-17). */
async function Home({ searchParams }: PageProps<"/">) {
  const t = await getTranslations("events");
  const filters = readUrlFilters(await searchParams);
  const [{ events, nextOffset }, pages] = await Promise.all([
    listEventsFromUrl(filters),
    getFilterPages(),
  ]);

  // Sur ordinateur, le fil est décalé vers la gauche du centre (10rem),
  // sans coller à la barre latérale.
  return (
    <div className="mx-auto grid max-w-[470px] gap-3 pt-3 sm:px-4 md:pt-6 lg:mr-auto lg:ml-[max(2rem,calc(50%-235px-10rem))]">
      <h1 className="sr-only">{t("listTitle")}</h1>
      {/* Filtres flottants : ils restent sous l'en-tête pendant le défilement. */}
      <div className="sticky top-[62px] z-20 grid px-4 sm:px-0 md:top-3">
        <FilterBar filters={filters} pages={pages} />
      </div>
      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center text-muted-foreground">
          <CalendarXIcon className="size-10" />
          <p>{isDefault(filters) ? t("noUpcoming") : t("noMatch")}</p>
        </div>
      ) : (
        <EventFeed
          // La clé réinitialise le fil quand les filtres changent.
          key={JSON.stringify(filters)}
          initialEvents={events}
          initialNext={nextOffset}
          filters={filters}
          load={loadEventsAction}
          onShare={trackShareClickAction}
          onView={trackEventViewAction}
        />
      )}
    </div>
  );
}

/**
 * Les paramètres d'URL et la session sont lus dans Accueil, derrière ce
 * Suspense : le cadre de la page reste instantané (Cache Components).
 */
export default function Page(props: PageProps<"/">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Home {...props} />
    </Suspense>
  );
}
