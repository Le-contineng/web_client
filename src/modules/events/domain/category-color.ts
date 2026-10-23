import type { Category } from "@/modules/events/domain/event";

/**
 * Couleur pleine de chaque catégorie (design/contineng-tokens.scss), sur
 * laquelle un texte blanc garde un contraste ≥ 4,5:1. Les mêmes valeurs sont
 * exposées en CSS (`--ct-cat-*`, `bg-cat-*`) dans src/app/globals.css.
 */
export const CATEGORY_COLORS = {
  match: "#B94F08",
  interClub: "#6C3FD1",
  orientation: "#0F7C86",
  party: "#B0306B",
  culture: "#8A6A00",
  conference: "#1E6FE0",
  campusLife: "#1E7F3E",
  other: "#4B5563",
} as const satisfies Record<Category, string>;

/** Couleur d'une catégorie ; « Autre » pour une clé inconnue. */
export function categoryColor(key: string): string {
  return key in CATEGORY_COLORS
    ? CATEGORY_COLORS[key as Category]
    : CATEGORY_COLORS.other;
}
