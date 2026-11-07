import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, getMyPage } from "@/modules/pages/server";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

/**
 * Coque de l'espace organisateur, commune à ses rubriques et à ses tâches :
 * fond gris très clair (Nuit en sombre), une seule colonne, une feuille
 * blanche. Réservée aux membres de la page ; l'API revérifie chaque action.
 */
async function StudioShell({
  params,
  children,
}: LayoutProps<"/studio/[slug]">) {
  const { slug } = await params;
  if (!(await getCurrentUser())) redirect(`/login?returnTo=/studio/${slug}`);
  if (!(await getMyPage(slug))) notFound();
  return (
    <div className="min-h-svh bg-secondary [--studio-ground:var(--secondary)] dark:bg-background dark:[--studio-ground:var(--background)]">
      <div className="mx-auto w-full max-w-3xl pb-24 md:pt-6">
        <div className="bg-card md:overflow-hidden md:rounded-xl md:border">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Paramètres et session lus derrière ce Suspense (Cache Components). */
export default function Layout(props: LayoutProps<"/studio/[slug]">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <StudioShell {...props} />
    </Suspense>
  );
}
