"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isMainTab, isStudioSection } from "@/spaces/user/components/main-tabs";

/**
 * N'affiche son contenu (la barre du bas) que sur les écrans principaux.
 * `studio={false}` l'exclut aussi de l'espace organisateur : un écran de
 * travail ne porte pas de bandeau sponsorisé.
 */
export function ShowOnMainTabs({
  children,
  studio = true,
}: {
  children: ReactNode;
  studio?: boolean;
}) {
  const path = usePathname();
  if (!isMainTab(path)) return null;
  if (!studio && isStudioSection(path)) return null;
  return children;
}
