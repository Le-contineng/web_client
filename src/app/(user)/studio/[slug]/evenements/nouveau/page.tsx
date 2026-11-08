import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventForm } from "@/modules/events";
import { createEventAction } from "@/modules/events/application/events.actions";
import { getEventById } from "@/modules/events/server";
import { getMyPage } from "@/modules/pages/server";
import { BackBar } from "@/shared/components/layout/BackBar";
import { StudioTaskHeader } from "@/spaces/organizer";

/**
 * Tâche « Publier un événement », au nom de la page de l'espace (US-11) ;
 * avec `?parent={id}`, un sous-événement de cet événement principal (ADR 0030
 * du backend), qui doit appartenir à la même page.
 */
async function NewEvent({
  params,
  searchParams,
}: PageProps<"/studio/[slug]/evenements/nouveau">) {
  const { slug } = await params;
  const page = await getMyPage(slug);
  if (!page) notFound();
  const t = await getTranslations();
  const parentId = (await searchParams).parent;
  const parent =
    typeof parentId === "string" ? await getEventById(parentId) : null;
  if (
    parentId &&
    (!parent || parent.organizerPageId !== page.id || parent.parent)
  ) {
    notFound();
  }
  return (
    <>
      <BackBar
        title={t("studio.taskBack", {
          page: page.name,
          section: t("studio.sections.events"),
        })}
        fallback={`/studio/${slug}`}
      />
      <StudioTaskHeader
        page={page}
        back={{ label: t("studio.sections.events"), href: `/studio/${slug}` }}
        title={parent ? t("subEvents.newSubEvent") : t("studio.task.newEvent")}
        subject={
          parent ? t("subEvents.within", { name: parent.name }) : undefined
        }
      />
      <div className="px-4 py-5 sm:px-6">
        <EventForm
          showPage={false}
          page={page}
          parent={parent ?? undefined}
          createAction={createEventAction}
        />
      </div>
    </>
  );
}

export default function Page(
  props: PageProps<"/studio/[slug]/evenements/nouveau">,
) {
  return (
    <Suspense>
      <NewEvent {...props} />
    </Suspense>
  );
}
