import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventForm, isEditable } from "@/modules/events";
import { updateEventAction } from "@/modules/events/application/events.actions";
import { getEventById } from "@/modules/events/server";
import { getMyPage } from "@/modules/pages/server";
import { BackBar } from "@/shared/components/layout/BackBar";
import { StudioTaskHeader } from "@/spaces/organizer";

/** Tâche « Modifier l'événement » (US-15) : un événement de la page, ni passé ni annulé. */
async function EditEvent({
  params,
}: PageProps<"/studio/[slug]/evenements/[id]/modifier">) {
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
        title={t("studio.task.editEvent")}
      />
      <div className="px-4 py-5 sm:px-6">
        {isEditable(event, new Date()) ? (
          <EventForm
            showPage={false}
            page={page}
            event={event}
            action={updateEventAction}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("events.notEditable")}
          </p>
        )}
      </div>
    </>
  );
}

export default function Page(
  props: PageProps<"/studio/[slug]/evenements/[id]/modifier">,
) {
  return (
    <Suspense>
      <EditEvent {...props} />
    </Suspense>
  );
}
