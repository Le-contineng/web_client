import { Suspense } from "react";
import { FeedView } from "@/spaces/user";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

/** Accueil = liste publique des événements, sans compte (US-01, US-16, US-17). */
async function Home({ searchParams }: PageProps<"/">) {
  return <FeedView searchParams={await searchParams} />;
}

/**
 * Les paramètres d'URL et la session sont lus dans Accueil, derrière ce
 * Suspense : le cadre de la page reste instantané (Cache Components).
 */
export default function Page(props: PageProps<"/">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Home {...props} />
    </Suspense>
  );
}
