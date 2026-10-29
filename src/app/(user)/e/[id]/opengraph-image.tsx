import sharp from "sharp";
import { eventImage, PUBLIC_IMAGE_HOST } from "@/modules/events";
import { getEventById } from "@/modules/events/server";
import { env } from "@/shared/config/env";
import { demoImage } from "@/shared/lib/demo-images";

export const size = { width: 1200, height: 630 };
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
 * L'image entière, sans rognage, centrée dans le cadre 1200 × 630 ; le reste
 * du cadre est rempli par la même image agrandie et floutée.
 */
async function framed(source: Buffer, background: string): Promise<Buffer> {
  const flat = await sharp(source)
    .rotate() // applique l'orientation EXIF des photos de téléphone
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
 * Image d'aperçu WhatsApp (US-36) : la photo de l'événement entière dans un cadre
 * 1200 × 630, en JPEG. WhatsApp n'affiche ni SVG ni WebP (format des photos
 * envoyées depuis le site, ADR 0014 du backend) et ignore les images trop
 * lourdes : un JPEG d'une centaine de Ko passe partout. Sans photo lisible,
 * l'image par défaut est utilisée.
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
  const jpeg = await framed(source, "#ffffff").catch(() =>
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
