"use client";

import { PanelLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type ReactNode,
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/shared/lib/utils";
import {
  type SidebarPanel,
  SidebarPanelContext,
} from "@/spaces/user/components/sidebar-panel";

const KEY = "contineng:sidebar-collapsed";
const EVENT = "contineng:barre";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false; // Stockage indisponible : barre étendue.
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

/**
 * Cadre de l'espace public : barre latérale étendue par défaut (modèle
 * TikTok), réductible aux icônes par un bouton. Réduite, l'en-tête n'affiche
 * que le logo ; le bouton pour l'étendre apparaît au survol (ou au focus
 * clavier) du logo. Le choix est mémorisé dans ce navigateur. Ouvrir un
 * tiroir (notifications, « Plus ») réduit la barre le temps qu'il est ouvert, sans
 * changer ce choix ; la barre peut quand même être étendue pendant ce temps.
 */
export function SidebarFrame({
  logo,
  compactLogo,
  sidebar,
  children,
}: {
  logo: ReactNode;
  compactLogo: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations("nav");
  const stored = useSyncExternalStore(subscribe, read, () => false);
  const [panel, setPanelState] = useState<SidebarPanel | null>(null);
  // État imposé tant qu'un panneau est ouvert (null = choix mémorisé).
  const [override, setOverride] = useState<boolean | null>(null);
  const collapsed = override ?? stored;

  const setPanel = useCallback((next: SidebarPanel | null) => {
    setPanelState(next);
    setOverride(next ? true : null);
  }, []);

  function toggle() {
    if (panel) {
      setOverride(!collapsed);
      return;
    }
    try {
      localStorage.setItem(KEY, collapsed ? "0" : "1");
    } catch {
      return;
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <SidebarPanelContext value={{ panel, setPanel, collapsed }}>
      <div
        data-collapsed={collapsed}
        className={cn(
          "min-h-dvh transition-[padding] duration-200",
          // La page suit le choix mémorisé : elle ne bouge pas quand un
          // panneau réduit la barre.
          stored ? "md:pl-[84px]" : "md:pl-[252px]",
        )}
      >
        <aside
          className={cn(
            // Verre clair flottant, à 12 px des bords de la fenêtre.
            "ct-glass ct-glass--scrim fixed inset-y-3 left-3 z-40 hidden [scrollbar-width:none] flex-col overflow-x-hidden overflow-y-auto rounded-[28px] px-3 pt-5 pb-4 transition-[width] duration-200 ease-out md:flex",
            collapsed ? "w-[72px]" : "w-60",
          )}
        >
          <div className="group/header relative mb-4 flex h-10 items-center justify-between gap-2 pl-1.5">
            {collapsed ? (
              <span className="group-focus-within/header:invisible group-hover/header:invisible">
                {compactLogo}
              </span>
            ) : (
              logo
            )}
            <button
              type="button"
              onClick={toggle}
              aria-label={collapsed ? t("expand") : t("collapse")}
              aria-pressed={collapsed}
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full text-[#434b57] outline-none hover:bg-foreground/7 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-[#b9c0ca]",
                // Réduite : le bouton prend la place du logo, visible au survol.
                collapsed &&
                  "absolute top-1 left-1.5 opacity-0 group-focus-within/header:opacity-100 group-hover/header:opacity-100",
              )}
            >
              <PanelLeftIcon className="size-5" />
            </button>
          </div>
          {sidebar}
        </aside>
        {children}
      </div>
    </SidebarPanelContext>
  );
}
