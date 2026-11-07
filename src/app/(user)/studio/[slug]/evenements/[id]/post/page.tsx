import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isEditable, PostComposer } from "@/modules/events";
import { getEventById } from "@/modules/events/server";
import { getMyPage } from "@/modules/pages/server";
import { BackBar } from "@/shared/components/layout/BackBar";
import { StudioTaskHeader } from "@/spaces/organizer";

/** Tâche « Nouveau post » (ADR 0023) : sur un événement de la page, ni passé ni annulé. */
async function NewPost({
  params,
}: PageProps<"/studio/[slug]/evenements/[id]/post">) {
  const { slug, id } = await params;
  const [page, event] = await Promise.all([getMyPage(slug), getEventById(id)]);
  if (!page || !event || event.organizerPageId !== page.id) notFound();
  const t = await getTranslations();
  const back = { label: t("studio.sections.events"), href: `/studio/${slug}` };
  return (
    <>
      <BackBar
        title={t("studio.taskBack", {
          page: page.name,
          section: t("studio.sections.events"),
        })}
        fallback={back.href}
      />
      <StudioTaskHeader
        page={page}
        back={back}
        title={t("posts.composer.title")}
        subject={event.name}
      />
      <div className="px-4 py-5 sm:px-6">
        {isEditable(event, new Date()) ? (
          <PostComposer pageId={page.id} eventId={event.id} />
        ) : (
          <p className="text-sm text-muted-foreground">{t("posts.closed")}</p>
        )}
      </div>
    </>
  );
}

export default function Page(
  props: PageProps<"/studio/[slug]/evenements/[id]/post">,
) {
  return (
    <Suspense>
      <NewPost {...props} />
    </Suspense>
  );
}
