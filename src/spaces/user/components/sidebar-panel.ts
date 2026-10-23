"use client";

import { createContext, useContext } from "react";

/** Tiroir qui s'ouvre contre la barre latérale (« Plus » est un popover). */
export type SidebarPanel = "notifications";

/**
 * Tiroir ouvert à côté de la barre latérale, collé à son bord : il suit la
 * largeur de la barre, réduite ou étendue.
 */
export const SidebarPanelContext = createContext<{
  panel: SidebarPanel | null;
  setPanel: (panel: SidebarPanel | null) => void;
  collapsed: boolean;
}>({ panel: null, setPanel: () => {}, collapsed: false });

export function useSidebarPanel() {
  return useContext(SidebarPanelContext);
}
