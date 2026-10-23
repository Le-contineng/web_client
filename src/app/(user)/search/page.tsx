import { SearchXIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  SearchBar,
  EventGrid,
  readUrlFilters,
  FilterChips,
  PERIODS,
  type Period,
} from "@/modules/events";
import { searchEvents } from "@/modules/events/server";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("search");
  return { title: t("title") };
}

/**
 * Onglet Rechercher, façon Explorer d'Instagram : champ en haut, filtres en
 * pastilles (période, catégories), grille de vignettes. Sans compte.
 */
async function AdminSearch({ searchParams }: PageProps<"/search">) {
  const t = await getTranslations("search");
  const params = await searchParams;
  const text = typeof params.q === "string" ? params.q : "";
  const raw = typeof params.period === "string" ? params.period : "";
  const period = (PERIODS as readonly string[]).includes(raw)
    ? (raw as Period)
    : null;
  const { categories } = readUrlFilters(params);
  const { events, total } = await searchEvents({
    text,
    period,
    categories,
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 pt-4 md:pt-6">
      <h1 className="sr-only">{t("title")}</h1>
      <div className="mx-auto w-full max-w-2xl">
        <SearchBar value={text} />
      </div>
      <FilterChips period={period} categories={categories} />
      <p role="status" className="text-sm text-muted-foreground">
        {t("results", { n: total })}
      </p>
      {events.length ? (
        <EventGrid events={events} className="lg:grid-cols-3 xl:grid-cols-3" />
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <SearchXIcon className="size-10" />
          <p>{t("noResults")}</p>
        </div>
      )}
    </div>
  );
}

/** La recherche vient de l'adresse : lue derrière ce Suspense (Cache Components). */
export default function Page(props: PageProps<"/search">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <AdminSearch {...props} />
    </Suspense>
  );
}
