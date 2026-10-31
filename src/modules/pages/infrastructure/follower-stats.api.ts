import "server-only";
import { z } from "zod";
import { api } from "@/shared/api/client";
import { withTranslatedErrors } from "@/modules/pages/infrastructure/errors";
import type {
  FollowerStats,
  FollowerStatsPeriod,
} from "@/modules/pages/domain/follower-stats";

/**
 * L'API range ces statistiques dans son module `audience`, encore nommé en
 * français : la route et les champs JSON sont traduits ici (ADR 0020).
 */
const count = z.number().int().nonnegative();
const response = z.object({
  total: count,
  gagnes: count,
  perdus: count,
  jours: z.array(
    z.object({ jour: z.string(), gagnes: count, perdus: count, total: count }),
  ),
});

export async function fetchFollowerStats(
  pageId: string,
  days: FollowerStatsPeriod,
): Promise<FollowerStats> {
  const raw = await withTranslatedErrors(() =>
    api<unknown>(
      `/api/v1/pages/${encodeURIComponent(pageId)}/abonnes/statistiques?jours=${days}`,
    ),
  );
  const stats = response.parse(raw);
  return {
    total: stats.total,
    gained: stats.gagnes,
    lost: stats.perdus,
    days: stats.jours.map((d) => ({
      date: d.jour,
      gained: d.gagnes,
      lost: d.perdus,
      total: d.total,
    })),
  };
}
