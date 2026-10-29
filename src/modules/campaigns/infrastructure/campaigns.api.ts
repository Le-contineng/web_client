import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import {
  type ActiveCampaigns,
  CAMPAIGN_PLACEMENTS,
  type Campaign,
  type CampaignInteraction,
  type CampaignPlacement,
  type CampaignSponsor,
  type CampaignTarget,
  selectActive,
} from "@/modules/campaigns/domain/campaign";
import { DEMO_SCENARIOS } from "@/modules/campaigns/infrastructure/demo-campaigns";
import { currentVisitor } from "@/modules/audience/server";
import { api, apiOrNull } from "@/shared/api/client";
import { env } from "@/shared/config/env";

/** Contrat de l'API (ADR 0023 du backend) : champs absents renvoyés à null. */
type CampaignPayload = Omit<Campaign, "sponsor" | "target" | "placements"> & {
  sponsor: {
    type: "PAGE" | "ACCOUNT";
    id: string;
    slug: string | null;
    name: string | null;
    photoUrl: string | null;
  };
  target: {
    type: "EVENT" | "PAGE" | "URL";
    eventId: string | null;
    pageSlug: string | null;
    url: string | null;
  };
  placements: string[];
};

function toSponsor(s: CampaignPayload["sponsor"]): CampaignSponsor | null {
  if (!s.name) return null;
  if (s.type === "ACCOUNT") {
    return { type: "ACCOUNT", id: s.id, name: s.name, photoUrl: s.photoUrl };
  }
  return s.slug
    ? {
        type: "PAGE",
        id: s.id,
        slug: s.slug,
        name: s.name,
        photoUrl: s.photoUrl,
      }
    : null;
}

function toTarget(t: CampaignPayload["target"]): CampaignTarget | null {
  if (t.type === "EVENT" && t.eventId)
    return { type: "EVENT", eventId: t.eventId };
  if (t.type === "PAGE" && t.pageSlug)
    return { type: "PAGE", pageSlug: t.pageSlug };
  if (t.type === "URL" && t.url) return { type: "URL", url: t.url };
  return null;
}

/** Une campagne incomplète (diffuseur ou cible disparus) n'est pas affichée. */
function toCampaign(p: CampaignPayload): Campaign | null {
  const sponsor = toSponsor(p.sponsor);
  const target = toTarget(p.target);
  if (!sponsor || !target) return null;
  return {
    ...p,
    sponsor,
    target,
    placements: p.placements.filter((x): x is CampaignPlacement =>
      (CAMPAIGN_PLACEMENTS as readonly string[]).includes(x),
    ),
  };
}

/** Tag des campagnes en cours mises en cache. */
const CAMPAIGNS_CACHE_TAG = "campaigns";

/** Campagnes en cours, les mêmes pour tous : mises en cache (ADR 0004). */
async function activeFromApi(): Promise<ActiveCampaigns> {
  "use cache";
  cacheLife("publicList");
  cacheTag(CAMPAIGNS_CACHE_TAG);
  // Une campagne absente ne doit jamais casser l'application.
  const payload = await api<Partial<Record<string, CampaignPayload>>>(
    "/api/v1/campaigns/active",
    { anonymous: true },
  ).catch(() => ({}) as Partial<Record<string, CampaignPayload>>);
  const result: ActiveCampaigns = {};
  for (const placement of CAMPAIGN_PLACEMENTS) {
    const p = payload[placement];
    const campaign = p && toCampaign(p);
    if (campaign) result[placement] = campaign;
  }
  return result;
}

/**
 * Client des campagnes (GET /api/v1/campaigns/active). CAMPAIGNS_DEMO
 * remplace l'API par un scénario de démonstration, pour essayer un design.
 */
export const campaignsApi = {
  async active(): Promise<ActiveCampaigns> {
    if (env.CAMPAIGNS_DEMO) {
      // Lu à chaque requête : la période de diffusion dépend de l'heure.
      await connection();
      return selectActive(DEMO_SCENARIOS[env.CAMPAIGNS_DEMO], new Date());
    }
    return activeFromApi();
  },
  /** Campagne publiée, pour sa page de partage ; `null` si absente ou non publiée. */
  async get(id: string): Promise<Campaign | null> {
    if (env.CAMPAIGNS_DEMO) {
      return (
        DEMO_SCENARIOS[env.CAMPAIGNS_DEMO].find((c) => c.id === id) ?? null
      );
    }
    const payload = await apiOrNull<CampaignPayload>(
      `/api/v1/campaigns/${encodeURIComponent(id)}`,
    ).catch(() => null);
    return payload && toCampaign(payload);
  },
  async track(
    campaignId: string,
    placement: CampaignPlacement,
    kind: CampaignInteraction,
  ): Promise<void> {
    if (env.CAMPAIGNS_DEMO) return;
    await api<void>(
      `/api/v1/campaigns/${encodeURIComponent(campaignId)}/interactions`,
      {
        body: {
          placement,
          kind,
          // Clic unique : le compte connecté (jeton) ou, sans compte, le cookie visiteur
          visitorId: kind === "CLICK" ? await currentVisitor() : undefined,
        },
      },
    );
  },
};
