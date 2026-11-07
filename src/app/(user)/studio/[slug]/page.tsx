import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { countViews } from "@/modules/audience/server";
import { readManagementTab } from "@/modules/events";
import { getPageEvents } from "@/modules/events/server";
import { getMyPage, getMyPages } from "@/modules/pages/server";
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

/** Rubrique « Événements » : les événements de la page par état, et leurs actions. */
async function StudioEvents({
  params,
  searchParams,
}: PageProps<"/studio/[slug]">) {
  const { slug } = await params;
  const [page, pages] = await Promise.all([getMyPage(slug), getMyPages()]);
  if (!page) notFound();
  const events = await getPageEvents(slug);
  const views = await countViews(
    page.id,
    events.map((e) => e.id),
  );
  const tab = readManagementTab((await searchParams).tab);
  return (
    <>
      <StudioHeader page={page} pages={pages} section="events" />
      <EventManagerList
        slug={slug}
        events={events}
        views={Object.fromEntries(views)}
        tab={tab}
      />
    </>
  );
}

export default function Page(props: PageProps<"/studio/[slug]">) {
  return (
    <Suspense>
      <StudioEvents {...props} />
    </Suspense>
  );
}
