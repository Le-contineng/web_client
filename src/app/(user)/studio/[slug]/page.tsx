import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { countViews } from "@/modules/audience/server";
import { readManagementTab } from "@/modules/events";
import { getPageEvents } from "@/modules/events/server";
import { getCurrentUser, getMyPage, getMyPages } from "@/modules/pages/server";
import { BackBar } from "@/shared/components/layout/BackBar";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";
import { EventManagerList, StudioHeader } from "@/spaces/organizer";

export async function generateMetadata({
  params,
}: PageProps<"/studio/[slug]">): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getMyPage((await params).slug).catch(() => null);
  return {
    title: page ? t("studio.title", { name: page.name }) : t("nav.myPages"),
    robots: { index: false },
  };
}

/**
 * Espace organisateur d'une page (lot 1) : ses événements par état, avec les
 * actions de gestion. Réservé aux membres ; l'API revérifie chaque action.
 */
async function Studio({ params, searchParams }: PageProps<"/studio/[slug]">) {
  const { slug } = await params;
  if (!(await getCurrentUser())) redirect(`/login?returnTo=/studio/${slug}`);
  const [page, pages] = await Promise.all([getMyPage(slug), getMyPages()]);
  if (!page) notFound();
  const events = await getPageEvents(slug);
  const views = await countViews(
    page.id,
    events.map((e) => e.id),
  );
  const tab = readManagementTab((await searchParams).tab);
  const t = await getTranslations();
  return (
    // Fond de l'espace : gris très clair en clair, Nuit en sombre ; les lignes
    // sont des feuilles blanches posées dessus
    <div className="min-h-svh bg-secondary [--studio-ground:var(--secondary)] dark:bg-background dark:[--studio-ground:var(--background)]">
      <div className="mx-auto w-full max-w-3xl pb-24 md:pt-6">
        {/* Sous-écran de « Mes pages » : retour sur téléphone, pas de barre du bas */}
        <BackBar title={t("nav.myPages")} fallback="/my-pages" />
        <div className="overflow-hidden md:rounded-xl md:border">
          <StudioHeader page={page} pages={pages} section="events" />
          <EventManagerList
            slug={slug}
            events={events}
            views={Object.fromEntries(views)}
            tab={tab}
          />
        </div>
      </div>
    </div>
  );
}

/** Paramètres d'URL et session lus derrière ce Suspense (Cache Components). */
export default function Page(props: PageProps<"/studio/[slug]">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Studio {...props} />
    </Suspense>
  );
}
