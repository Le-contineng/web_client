import "server-only";
import sharp from "sharp";

/**
 * Plus grand côté de l'image d'aperçu, en pixels : au-delà, l'image est
 * réduite (proportions gardées) pour rester légère ; en deçà, elle garde sa
 * taille, jamais agrandie.
 */
export const SHARE_IMAGE_MAX_SIDE = 1200;

/**
 * Poids au-delà duquel l'image est recompressée plus fort : WhatsApp ignore
 * les aperçus trop lourds.
 */
export const SHARE_IMAGE_MAX_BYTES = 300_000;

/**
 * Image d'aperçu WhatsApp (US-36) : l'image entière, dans ses propres
 * proportions (ni cadre imposé, ni rognage, ni fond), convertie en JPEG.
 * WhatsApp n'affiche ni SVG ni WebP. Seul son plus grand côté est borné à
 * {@link SHARE_IMAGE_MAX_SIDE} ; si le JPEG dépasse
 * {@link SHARE_IMAGE_MAX_BYTES}, il est recompressé une fois, plus fort.
 *
 * @param background couleur des zones transparentes (le JPEG n'en a pas)
 */
export async function toShareJpeg(
  source: Buffer,
  background: string,
): Promise<Buffer> {
  const resized = await sharp(source)
    .rotate() // applique l'orientation EXIF des photos de téléphone
    .flatten({ background })
    .resize(SHARE_IMAGE_MAX_SIDE, SHARE_IMAGE_MAX_SIDE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toBuffer();
  const jpeg = await sharp(resized)
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  if (jpeg.length <= SHARE_IMAGE_MAX_BYTES) return jpeg;
  return sharp(resized).jpeg({ quality: 60, mozjpeg: true }).toBuffer();
}
