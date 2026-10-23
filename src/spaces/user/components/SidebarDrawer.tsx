"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import {
  type SidebarPanel,
  useSidebarPanel,
} from "@/spaces/user/components/sidebar-panel";

/**
 * Tiroir sur toute la hauteur, collé à la barre latérale (modèle TikTok) :
 * titre et croix en tête, contenu qui défile. Il se ferme par la croix, Échap,
 * un clic hors de la barre et du tiroir, ou un changement de page.
 */
export function SidebarDrawer({
  name,
  title,
  trigger,
  children,
}: {
  name: SidebarPanel;
  title: string;
  /** Bouton qui ouvre le tiroir, pour lui rendre le focus à la fermeture. */
  trigger: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}) {
  const t = useTranslations("notifications");
  const { panel, setPanel, collapsed } = useSidebarPanel();
  const open = panel === name;
  const drawer = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const path = usePathname();

  useEffect(() => setPanel(null), [path, setPanel]);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPanel(null);
        trigger.current?.focus();
      }
    }
    function onPointer(e: PointerEvent) {
      const target = e.target as Node;
      // La barre latérale reste utilisable (réduire, étendre, changer de tiroir).
      const sidebar = trigger.current?.closest("aside");
      if (!drawer.current?.contains(target) && !sidebar?.contains(target)) {
        setPanel(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, setPanel, trigger]);

  if (!open) return null;
  return (
    <div
      ref={drawer}
      role="dialog"
      aria-label={title}
      className={cn(
        "ct-sheet fixed inset-y-3 z-30 flex w-[400px] animate-in flex-col rounded-[28px] transition-[left] duration-200 ease-out fade-in-0 slide-in-from-left-4",
        collapsed
          ? "left-[96px] max-w-[calc(100vw-108px)]"
          : "left-[264px] max-w-[calc(100vw-276px)]",
      )}
    >
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          ref={closeButton}
          type="button"
          onClick={() => {
            setPanel(null);
            trigger.current?.focus();
          }}
          aria-label={t("close")}
          className="ct-press grid size-11 place-items-center rounded-full bg-foreground/8 outline-none hover:bg-foreground/12 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <XIcon className="size-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">{children}</div>
    </div>
  );
}

/** Classes d'une entrée de la barre qui ouvre un tiroir (active quand il l'est). */
export function drawerTriggerClass(open: boolean) {
  return cn(
    "flex h-11 w-full items-center gap-3 rounded-full px-3 text-base transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-6 [&_svg]:shrink-0",
    open &&
      "bg-ct-blue-soft font-semibold text-ct-blue-label shadow-[inset_0_0_0_1px_rgb(47_160_193/0.24)] hover:bg-ct-blue-soft [&_svg]:fill-current",
  );
}
