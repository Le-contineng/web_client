import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FeedView } from "@/spaces/user";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

/** Accueil = liste publique des événements, sans compte (US-01, US-16, US-17). */
async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  // Les filtres sont sur la recherche : un ancien lien filtré (`/?period=past`)
  // y mène avec les mêmes filtres, au lieu d'un fil filtré sans le dire.
  const filters = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = params[key];
    if (value) filters.set(key, Array.isArray(value) ? value.join(",") : value);
  }
  if (filters.size) redirect(`/search?${filters}`);
  return <FeedView />;
}

const FILTER_KEYS = ["q", "period", "category", "page"] as const;

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
