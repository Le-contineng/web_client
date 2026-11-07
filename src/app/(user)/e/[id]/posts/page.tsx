import { CalendarXIcon } from "@/shared/components/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { EventPostFeed, MarkPostsSeen } from "@/modules/events";
import { getEventById, getEventPosts } from "@/modules/events/server";
import { BackBar } from "@/shared/components/layout/BackBar";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";
import { buttonVariants } from "@/shared/ui/button";

export async function generateMetadata({
  params,
}: PageProps<"/e/[id]/posts">): Promise<Metadata> {
  const event = await getEventById((await params).id);
  const t = await getTranslations();
  if (!event) return { title: t("events.notFound") };
  return {
    title: `${t("posts.title")} · ${event.name}`,
    alternates: { canonical: `/e/${event.id}/posts` },
  };
}

/** Fil des posts d'un événement, accessible sans compte (ADR 0023). */
async function EventPostsPage({ params }: PageProps<"/e/[id]/posts">) {
  const { id } = await params;
  const t = await getTranslations();
  const [event, page] = await Promise.all([
    getEventById(id),
    getEventPosts(id),
  ]);

  if (!event) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <CalendarXIcon className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{t("events.notFound")}</h1>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          {t("events.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-10 md:pt-8">
      <BackBar title={t("posts.title")} fallback={`/e/${event.id}`} />
      <MarkPostsSeen
        eventId={event.id}
        latestAt={event.posts?.latestAt ?? null}
      />
      <header className="grid gap-1 px-4 py-4 sm:px-0">
        <h1 className="text-xl leading-tight font-semibold">{event.name}</h1>
        <Link
          href={`/e/${event.id}`}
          className="text-sm text-brand hover:underline"
        >
          {t("posts.backToEvent")}
        </Link>
      </header>
      <EventPostFeed
        eventId={event.id}
        organizer={event.organizer}
        initial={page ?? { posts: [], nextCursor: null }}
      />
    </div>
  );
}

/** Paramètres d'URL lus derrière ce Suspense (Cache Components). */
export default function Page(props: PageProps<"/e/[id]/posts">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <EventPostsPage {...props} />
    </Suspense>
  );
}
