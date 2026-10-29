import sharp from "sharp";
import { getCampaign } from "@/modules/campaigns/server";
import { env } from "@/shared/config/env";
import { clientEnv } from "@/shared/config/env.client";
import { demoImage } from "@/shared/lib/demo-images";

export const size = { width: 1200, height: 630 };
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
 * L'image entière, sans rognage, centrée dans le cadre 1200 × 630 ; le reste
 * du cadre est rempli par la même image agrandie et floutée.
 */
async function framed(source: Buffer, background: string): Promise<Buffer> {
  const flat = await sharp(source)
    .flatten({ background }) // le JPEG n'a pas de transparence
    .toBuffer();
  const [backdrop, picture] = await Promise.all([
    sharp(flat)
      .resize(size.width, size.height, { fit: "cover" })
      .blur(30)
      .modulate({ brightness: 0.8 })
      .toBuffer(),
    sharp(flat).resize(size.width, size.height, { fit: "inside" }).toBuffer(),
  ]);
  return sharp(backdrop)
    .composite([{ input: picture, gravity: "centre" }])
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}

/**
 * Image d'aperçu WhatsApp d'une campagne partagée : son affiche, entière dans un cadre
 * 1200 × 630 et convertie en JPEG (WhatsApp n'affiche ni SVG ni WebP). Sans
 * affiche lisible, l'image par défaut.
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
  const jpeg = await framed(source, campaign?.accentColor ?? "#ffffff").catch(
    () =>
      sharp(Buffer.from(demoImage("defaut")))
        .resize(size.width, size.height, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer(),
  );
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
