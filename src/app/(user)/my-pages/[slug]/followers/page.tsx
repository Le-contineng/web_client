import { redirect } from "next/navigation";
import { Suspense } from "react";

/** Ancienne adresse : l'audience vit désormais dans l'espace organisateur. */
async function ToStudio({ params }: PageProps<"/my-pages/[slug]/followers">) {
  const { slug } = await params;
  redirect(`/studio/${encodeURIComponent(slug)}/audience`);
  return null;
}

export default function Page(props: PageProps<"/my-pages/[slug]/followers">) {
  return (
    <Suspense>
      <ToStudio {...props} />
    </Suspense>
  );
}
