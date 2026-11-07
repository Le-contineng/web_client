import { redirect } from "next/navigation";
import { Suspense } from "react";

/** Ancienne adresse : l'équipe vit désormais dans l'espace organisateur. */
async function ToStudio({ params }: PageProps<"/my-pages/[slug]/access">) {
  const { slug } = await params;
  redirect(`/studio/${encodeURIComponent(slug)}/equipe`);
  return null;
}

export default function Page(props: PageProps<"/my-pages/[slug]/access">) {
  return (
    <Suspense>
      <ToStudio {...props} />
    </Suspense>
  );
}
