import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getEventById } from "@/modules/events/server";

/** Ancienne adresse : la modification d'un événement se fait dans l'espace organisateur de la page. */
async function ToStudio({ params }: PageProps<"/e/[id]/edit">) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();
  redirect(
    `/studio/${encodeURIComponent(event.organizer.slug)}/evenements/${encodeURIComponent(id)}/modifier`,
  );
  return null;
}

export default function Page(props: PageProps<"/e/[id]/edit">) {
  return (
    <Suspense>
      <ToStudio {...props} />
    </Suspense>
  );
}
