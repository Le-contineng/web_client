"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Fiche d'un événement : sa photo occupe le haut de l'écran, avec ses propres boutons. */
const OVER_IMAGE = /^\/e\/[^/]+$/;

/**
 * Bande de verre collante de l'en-tête mobile, coins bas arrondis. Sur la
 * fiche d'un événement, elle laisse la place à la photo et à ses cercles de
 * verre (retour, partage).
 */
export function MobileHeaderFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (OVER_IMAGE.test(path)) return null;
  return (
    <header className="ct-glass ct-glass--scrim ct-navbar md:hidden">
      {children}
    </header>
  );
}
