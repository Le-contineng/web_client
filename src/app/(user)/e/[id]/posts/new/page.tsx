import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isEditable, PostComposer } from "@/modules/events";
import { getEventById } from "@/modules/events/server";
import { getMyPageById } from "@/modules/pages/server";
import { BackBar } from "@/shared/components/layout/BackBar";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";
import { buttonVariants } from "@/shared/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("posts.composer.title"), robots: { index: false } };
}

/**
 * Publication d'un post (ADR 0023) : réservée aux membres de la page
 * organisatrice, sur un événement ni passé ni annulé. Ce n'est qu'un confort
 * d'affichage : l'API revérifie les deux.
 */
async function NewPostPage({ params }: PageProps<"/e/[id]/posts/new">) {
  const { id } = await params;
  const t = await getTranslations();
  const event = await getEventById(id);
  if (!event) notFound();
  const page = await getMyPageById(event.organizerPageId);
  const refusal = !page
    ? t("posts.notAllowed")
    : !isEditable(event, new Date())
      ? t("posts.closed")
      : null;

  return (
    <div className="mx-auto w-full max-w-[470px] px-4 pb-10 md:pt-8">
      <BackBar
        title={t("posts.composer.title")}
        fallback={`/e/${event.id}/posts`}
      />
      <header className="grid gap-1 py-4">
        <h1 className="text-xl leading-tight font-semibold">
          {t("posts.composer.title")}
        </h1>
        <p className="truncate text-sm text-muted-foreground">{event.name}</p>
      </header>
      {refusal ? (
        <div className="grid justify-items-start gap-4">
          <p>{refusal}</p>
          <Link
            href={`/e/${event.id}/posts`}
            className={buttonVariants({ variant: "outline" })}
          >
            {t("posts.backToEvent")}
          </Link>
        </div>
      ) : (
        <PostComposer pageId={event.organizerPageId} eventId={event.id} />
      )}
    </div>
  );
}

/** Paramètres d'URL et session lus derrière ce Suspense (Cache Components). */
export default function Page(props: PageProps<"/e/[id]/posts/new">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <NewPostPage {...props} />
    </Suspense>
  );
}
