"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * En-tête du téléphone, affiché seulement sur l'accueil (les autres pages ont
 * leur propre titre). Il s'efface quand on fait défiler vers le bas et revient
 * dès qu'on remonte, comme sur les réseaux sociaux.
 */
export function AutoHideHeader({ children }: { children: ReactNode }) {
  const onHome = usePathname() === "/";
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (!onHome) return;
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      // Petits mouvements ignorés ; toujours visible tout en haut
      if (Math.abs(y - lastY.current) < 6) return;
      setHidden(y > lastY.current && y > 56);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  if (!onHome) return null;
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-background/95 backdrop-blur transition-transform duration-300 ease-(--ease-soft) md:hidden",
        hidden && "-translate-y-full",
      )}
    >
      {children}
    </header>
  );
}
