"use client";

import { usePathname } from "next/navigation";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

/** Défilement minimal (px) avant de changer d'état : pas de clignotement. */
const THRESHOLD = 8;

/**
 * Capsule de verre flottante de la barre d'onglets. Elle se compacte (icônes
 * seules, centrée) quand on descend dans la page et revient quand on remonte.
 * Un seul écouteur de défilement passif, sans calcul par image.
 */
export function TabBar({
  label,
  count,
  children,
}: {
  label: string;
  /** Nombre d'onglets : largeur de la barre compacte. */
  count: number;
  children: ReactNode;
}) {
  const path = usePathname();
  // Rattaché à la page : un changement de page rend la barre entière.
  const [state, setState] = useState({ path, compact: false });
  const compact = state.path === path && state.compact;

  useEffect(() => {
    let last = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - last) < THRESHOLD) return;
      setState({ path, compact: y > last && y > 80 });
      last = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  return (
    // Le cadre masque la barre sur ordinateur (la barre latérale prend le relais).
    <div className="md:hidden">
      <nav
        aria-label={label}
        className={cn(
          "ct-glass ct-glass--scrim ct-tabbar",
          compact && "is-compact",
        )}
        style={{ "--tabs": count } as CSSProperties}
      >
        {children}
      </nav>
    </div>
  );
}
