import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CATEGORY_COLORS,
  categoryColor,
} from "@/modules/events/domain/category-color";
import { CATEGORIES } from "@/modules/events/domain/event";

/** Luminance relative WCAG d'une couleur #RRGGBB. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

describe("couleurs des catégories", () => {
  it("donne une couleur à chaque catégorie, par sa clé", () => {
    expect(categoryColor("match")).toBe("#B94F08");
    expect(categoryColor("campusLife")).toBe("#1E7F3E");
    for (const c of CATEGORIES)
      expect(categoryColor(c)).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("retombe sur « Autre » pour une clé inconnue", () => {
    expect(categoryColor("inconnue")).toBe(CATEGORY_COLORS.other);
  });

  it("garde un texte blanc lisible (≥ 4,5:1) sur chaque couleur", () => {
    for (const c of CATEGORIES) {
      expect(
        1.05 / (luminance(categoryColor(c)) + 0.05),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("reprend les mêmes valeurs que les variables CSS --ct-cat-*", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    for (const c of CATEGORIES) {
      const name = c.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`);
      expect(css).toContain(
        `--ct-cat-${name}: ${categoryColor(c).toLowerCase()};`,
      );
    }
  });
});
