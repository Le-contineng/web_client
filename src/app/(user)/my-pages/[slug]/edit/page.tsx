import { redirect } from "next/navigation";
import { Suspense } from "react";

/** Ancienne adresse : la modification de la page vit désormais dans l'espace organisateur. */
async function ToStudio({ params }: PageProps<"/my-pages/[slug]/edit">) {
  const { slug } = await params;
  redirect(`/studio/${encodeURIComponent(slug)}/profil`);
  return null;
}

export default function Page(props: PageProps<"/my-pages/[slug]/edit">) {
  return (
    <Suspense>
      <ToStudio {...props} />
    </Suspense>
  );
}
