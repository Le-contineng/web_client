import { getCampaign } from "@/modules/campaigns/server";
import { env } from "@/shared/config/env";
import { clientEnv } from "@/shared/config/env.client";
import { demoImage } from "@/shared/lib/demo-images";
import { toShareJpeg } from "@/shared/lib/share-image";

export const contentType = "image/jpeg";

/** Affiche de la campagne : média de l'API, ou fichier du site (démonstration). */
async function poster(address: string | null): Promise<Buffer | null> {
  const url = address?.startsWith("/api/v1/medias/")
    ? `${env.API_URL}${address}`
    : address?.startsWith("/")
      ? `${clientEnv.NEXT_PUBLIC_SITE_URL}${address}`
      : null;
  if (!url) return null;
  const response = await fetch(url).catch(() => null);
  if (!response?.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Image d'aperçu WhatsApp d'une campagne partagée : son affiche entière, dans
 * ses propres proportions, convertie en JPEG (toShareJpeg). Pas de `size`
 * exporté : la taille n'est pas fixée. Sans affiche lisible, l'image par
 * défaut.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const campaign = await getCampaign((await params).id);
  const source =
    (await poster(campaign?.posterUrl ?? null)) ??
    Buffer.from(demoImage("defaut"));
  const background = campaign?.accentColor ?? "#ffffff";
  const jpeg = await toShareJpeg(source, background).catch(() =>
    toShareJpeg(Buffer.from(demoImage("defaut")), background),
  );
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
