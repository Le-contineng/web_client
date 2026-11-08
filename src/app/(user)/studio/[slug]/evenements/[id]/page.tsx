import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { countViews } from "@/modules/audience/server";
import {
  getEventById,
  getEventPosts,
  getSubEvents,
} from "@/modules/events/server";
import { getMyPage } from "@/modules/pages/server";
import { EventAdmin } from "@/spaces/organizer";

export async function generateMetadata({
  params,
}: PageProps<"/studio/[slug]/evenements/[id]">): Promise<Metadata> {
  const t = await getTranslations();
  const event = await getEventById((await params).id).catch(() => null);
  return {
    title: event?.name ?? t("studio.admin.title"),
    robots: { index: false },
  };
}

/** Administration d'un événement de la page : chiffres, posts, programme, actions. */
async function Admin({ params }: PageProps<"/studio/[slug]/evenements/[id]">) {
  const { slug, id } = await params;
  const [page, event] = await Promise.all([getMyPage(slug), getEventById(id)]);
  if (!page || !event || event.organizerPageId !== page.id) notFound();
  const [posts, subEvents, views] = await Promise.all([
    getEventPosts(id),
    event.parent ? Promise.resolve([]) : getSubEvents(id),
    countViews(page.id, [id]),
  ]);
  return (
    <EventAdmin
      slug={slug}
      event={event}
      posts={posts?.posts ?? []}
      subEvents={subEvents}
      views={views.get(id) ?? 0}
    />
  );
}

export default function Page(
  props: PageProps<"/studio/[slug]/evenements/[id]">,
) {
  return (
    <Suspense>
      <Admin {...props} />
    </Suspense>
  );
}
