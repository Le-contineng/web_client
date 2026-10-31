import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FeedView } from "@/spaces/user";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("events.feedTabs");
  return { title: t("following"), robots: { index: false } };
}

/** Onglet « Abonnements » : le fil des pages suivies (ADR 0019), compte obligatoire. */
async function Following({ searchParams }: PageProps<"/following">) {
  return <FeedView searchParams={await searchParams} followed />;
}

/** La session et l'adresse sont lues dans Following, derrière ce Suspense (Cache Components). */
export default function Page(props: PageProps<"/following">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Following {...props} />
    </Suspense>
  );
}
