import { redirect } from "next/navigation";
import { Suspense } from "react";

/** Ancienne adresse : la gestion de la page vit désormais dans l'espace organisateur. */
async function ToStudio({ params }: PageProps<"/my-pages/[slug]">) {
  const { slug } = await params;
  redirect(`/studio/${encodeURIComponent(slug)}`);
  return null;
}

export default function Page(props: PageProps<"/my-pages/[slug]">) {
  return (
    <Suspense>
      <ToStudio {...props} />
    </Suspense>
  );
}
