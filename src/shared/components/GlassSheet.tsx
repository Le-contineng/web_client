"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/sheet";

/** Glissement (px) de la poignée qui agrandit, réduit ou ferme la feuille. */
const DRAG = 48;

/**
 * Feuille modale de verre, posée en bas de l'écran (rayon 34, poignée
 * 40 × 5). Deux hauteurs : 52vh, ou pleine hauteur en touchant ou en tirant
 * la poignée vers le haut ; la tirer vers le bas la réduit puis la ferme.
 * Échap, un appui hors de la feuille ou la croix la ferment aussi.
 */
export function GlassSheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const t = useTranslations();
  const [full, setFull] = useState(false);
  const start = useRef<number | null>(null);
  // Un glissement ne compte pas aussi comme un appui.
  const dragged = useRef(false);

  function change(next: boolean) {
    if (!next) setFull(false);
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={change}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn(
          "ct-sheet gap-0 overflow-hidden border-none text-base data-[side=bottom]:inset-x-2 data-[side=bottom]:bottom-[calc(0.5rem+env(safe-area-inset-bottom))] data-[side=bottom]:mx-auto data-[side=bottom]:max-w-lg",
          "transition-[height,opacity,translate] duration-(--glass-dur-morph) ease-(--glass-ease) motion-reduce:transition-opacity",
          full
            ? "data-[side=bottom]:h-[calc(100dvh-56px)]"
            : "data-[side=bottom]:h-[52vh]",
          className,
        )}
      >
        <button
          type="button"
          aria-label={full ? t("common.collapse") : t("common.expand")}
          aria-expanded={full}
          onClick={() => {
            if (!dragged.current) setFull(!full);
            dragged.current = false;
          }}
          onPointerDown={(e) => {
            start.current = e.clientY;
          }}
          onPointerUp={(e) => {
            if (start.current === null) return;
            const delta = e.clientY - start.current;
            start.current = null;
            dragged.current = Math.abs(delta) > DRAG;
            if (delta < -DRAG) setFull(true);
            else if (delta > DRAG) {
              if (full) setFull(false);
              else change(false);
            }
          }}
          className="absolute inset-x-20 top-0 z-10 flex h-11 touch-none justify-center rounded-b-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span aria-hidden className="ct-sheet__handle" />
        </button>
        <div className="flex items-center justify-between gap-3 px-5 pt-6 pb-2">
          <SheetTitle className="text-2xl font-bold">{title}</SheetTitle>
          <button
            type="button"
            onClick={() => change(false)}
            aria-label={t("notifications.close")}
            className="ct-press grid size-11 shrink-0 place-items-center rounded-full bg-foreground/8 outline-none hover:bg-foreground/12 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain pb-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
