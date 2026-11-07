import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventForm } from "@/modules/events";
import { createEventAction } from "@/modules/events/application/events.actions";
import { getMyPage } from "@/modules/pages/server";
import { BackBar } from "@/shared/components/layout/BackBar";
import { StudioTaskHeader } from "@/spaces/organizer";

/** Tâche « Publier un événement », au nom de la page de l'espace (US-11). */
async function NewEvent({
  params,
}: PageProps<"/studio/[slug]/evenements/nouveau">) {
  const { slug } = await params;
  const page = await getMyPage(slug);
  if (!page) notFound();
  const t = await getTranslations();
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
        title={t("studio.task.newEvent")}
      />
      <div className="px-4 py-5 sm:px-6">
        <EventForm page={page} createAction={createEventAction} />
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
