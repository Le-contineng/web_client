/**
 * Génère les icônes de l'application installable (PWA) à partir du logo
 * officiel (design/contineng-logo.svg) : le pictogramme en 4 formes sur une
 * tuile encre #0A0A0A. À relancer si le logo change : `npm run icons`.
 *
 * - public/icons/icon-192.png, icon-512.png : icônes du manifeste (coins
 *   arrondis à 25 %, pictogramme sur 72 % de la tuile)
 * - public/icons/icon-maskable-512.png : variante « maskable » (Android découpe
 *   l'icône en cercle ou en goutte : le pictogramme reste dans la zone sûre de 80 %)
 * - src/app/apple-icon.png : écran d'accueil iPhone (carré plein, iOS arrondit)
 * - src/app/icon.svg : icône de l'onglet du navigateur (nette à toute taille)
 *
 * Le fond de l'écran de lancement (splash) est la même encre : `background_color`
 * du manifeste (src/app/manifest.ts).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const BACKGROUND = "#0A0A0A";
const logo = await readFile("design/contineng-logo.svg", "utf8");
const [vx, vy, vw, vh] = logo
  .match(/viewBox="([^"]+)"/)[1]
  .split(/\s+/)
  .map(Number);
const shapes = logo.match(/<path[^>]*>(<\/path>)?/g).join("");

/**
 * @param {number} size côté en pixels
 * @param {{ rounded: boolean, scale: number }} options coins arrondis, part de la tuile occupée par le pictogramme
 */
function svg(size, { rounded, scale }) {
  const radius = rounded ? size * 0.25 : 0;
  const mark = size * scale;
  const offset = (size - mark) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BACKGROUND}"/>
  <svg x="${offset}" y="${offset}" width="${mark}" height="${mark}" viewBox="${vx} ${vy} ${vw} ${vh}">${shapes}</svg>
</svg>`;
}

async function png(path, size, options) {
  await sharp(Buffer.from(svg(size, options)))
    .png()
    .toFile(path);
  console.log(`✓ ${path}`);
}

await mkdir("public/icons", { recursive: true });
await png("public/icons/icon-192.png", 192, { rounded: true, scale: 0.72 });
await png("public/icons/icon-512.png", 512, { rounded: true, scale: 0.72 });
await png("public/icons/icon-maskable-512.png", 512, {
  rounded: false,
  scale: 0.56,
});
await png("src/app/apple-icon.png", 180, { rounded: false, scale: 0.68 });
await writeFile(
  "src/app/icon.svg",
  svg(64, { rounded: true, scale: 0.72 }) + "\n",
);
console.log("✓ src/app/icon.svg");
