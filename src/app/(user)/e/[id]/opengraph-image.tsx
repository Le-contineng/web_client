import { eventImage, PUBLIC_IMAGE_HOST } from "@/modules/events";
import { getEventById } from "@/modules/events/server";
import { env } from "@/shared/config/env";
import { demoImage } from "@/shared/lib/demo-images";
import { toShareJpeg } from "@/shared/lib/share-image";

export const contentType = "image/jpeg";

/**
 * Photo de l'événement, quel que soit son format : sa photo (API, qui
 * redirige vers le stockage), sinon la photo publique de sa catégorie.
 * `null` si elle est introuvable.
 */
async function photo(address: string | null): Promise<Buffer | null> {
  const url = address?.startsWith("/api/v1/medias/")
    ? `${env.API_URL}${address}`
    : address?.startsWith(PUBLIC_IMAGE_HOST)
      ? address
      : null;
  if (!url) return null;
  const response = await fetch(url).catch(() => null);
  if (!response?.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Image d'aperçu WhatsApp (US-36) : la photo de l'événement entière, dans ses
 * propres proportions, en JPEG (toShareJpeg). WhatsApp n'affiche ni SVG ni
 * WebP (format des photos envoyées depuis le site, ADR 0014 du backend). Pas
 * de `size` exporté : la taille n'est pas fixée, WhatsApp lit celle du
 * fichier. Sans photo lisible, l'image par défaut est utilisée.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const event = await getEventById((await params).id);
  const source =
    (await photo(event ? eventImage(event) : null)) ??
    Buffer.from(demoImage("defaut"));
  const jpeg = await toShareJpeg(source, "#ffffff").catch(() =>
    toShareJpeg(Buffer.from(demoImage("defaut")), "#ffffff"),
  );
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
