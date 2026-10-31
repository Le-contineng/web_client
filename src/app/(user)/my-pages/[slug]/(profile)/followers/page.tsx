import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FollowerStatsView } from "@/modules/pages";
import {
  getFollowerStats,
  getMyPage,
  readFollowerStatsPeriod,
} from "@/modules/pages/server";

/** Onglet « Abonnés », pour tous les membres de la page (ADR 0020). */
async function MyPageFollowers({
  params,
  searchParams,
}: PageProps<"/my-pages/[slug]/followers">) {
  const { slug } = await params;
  const page = await getMyPage(slug);
  if (!page) return null;
  const period = readFollowerStatsPeriod((await searchParams).days);
  const stats = await getFollowerStats(page.id, period).catch(() => null);
  if (!stats) {
    const t = await getTranslations("pages.followerStats");
    return (
      <p className="mx-4 rounded-xl border bg-muted/40 p-4 text-sm sm:mx-0">
        {t("unavailable")}
      </p>
    );
  }
  return (
    <FollowerStatsView
      stats={stats}
      period={period}
      basePath={`/my-pages/${slug}/followers`}
    />
  );
}

/** Les paramètres sont lus derrière ce Suspense (Cache Components). */
export default function Page(props: PageProps<"/my-pages/[slug]/followers">) {
  return (
    <Suspense>
      <MyPageFollowers {...props} />
    </Suspense>
  );
}
