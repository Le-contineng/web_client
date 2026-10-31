"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Pages du fil : l'en-tête du téléphone n'apparaît que là. */
export const FEED_PATHS = ["/", "/following"];

/**
 * En-tête du téléphone, affiché seulement sur le fil (les autres pages ont
 * leur propre titre). Il reste collé en haut pendant le défilement.
 */
export function AutoHideHeader({ children }: { children: ReactNode }) {
  if (!FEED_PATHS.includes(usePathname())) return null;
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur md:hidden">
      {children}
    </header>
  );
}
