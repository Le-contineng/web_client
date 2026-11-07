import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FollowerStatsView } from "@/modules/pages";
import {
  getFollowerStats,
  getMyPage,
  getMyPages,
  readFollowerStatsPeriod,
} from "@/modules/pages/server";
import { StudioHeader } from "@/spaces/organizer";

/** Rubrique « Audience » : l'évolution des abonnés, pour tous les membres (ADR 0020). */
async function StudioAudience({
  params,
  searchParams,
}: PageProps<"/studio/[slug]/audience">) {
  const { slug } = await params;
  const [page, pages] = await Promise.all([getMyPage(slug), getMyPages()]);
  if (!page) notFound();
  const t = await getTranslations();
  const period = readFollowerStatsPeriod((await searchParams).days);
  const stats = await getFollowerStats(page.id, period).catch(() => null);
  return (
    <>
      <StudioHeader page={page} pages={pages} section="audience" />
      <div className="px-4 py-5 sm:px-6">
        {stats ? (
          <FollowerStatsView
            stats={stats}
            period={period}
            basePath={`/studio/${encodeURIComponent(slug)}/audience`}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("pages.followerStats.unavailable")}
          </p>
        )}
      </div>
    </>
  );
}

export default function Page(props: PageProps<"/studio/[slug]/audience">) {
  return (
    <Suspense>
      <StudioAudience {...props} />
    </Suspense>
  );
}
