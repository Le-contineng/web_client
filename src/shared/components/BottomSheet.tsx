"use client";

import { Drawer } from "@base-ui/react/drawer";
import { type ReactNode, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

/** Mi-hauteur à l'ouverture, puis presque tout l'écran. */
const HALF = 0.55;
const FULL = 1;
const SNAP_POINTS = [HALF, FULL];
/** Un geste de molette envoie des dizaines d'événements : un seul changement par geste. */
const WHEEL_PAUSE_MS = 500;

/**
 * Panneau qui monte du bas, façon application mobile : il glisse depuis le bas
 * à l'ouverture et s'arrête à mi-hauteur ; glisser ou faire défiler vers le
 * haut l'étend presque en plein écran, et seulement ensuite son contenu
 * défile ; glisser ou faire défiler vers le bas, une fois le contenu revenu
 * en haut, le réduit puis le ferme.
 */
export function BottomSheet({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  const [snapPoint, setSnapPoint] = useState<Drawer.Root.SnapPoint | null>(
    HALF,
  );
  const lastWheelChange = useRef(0);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        // Chaque ouverture repart de la mi-hauteur
        if (next) setSnapPoint(HALF);
        onOpenChange(next);
      }}
      snapPoints={SNAP_POINTS}
      snapPoint={snapPoint}
      onSnapPointChange={setSnapPoint}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.4*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:opacity-0 data-swiping:duration-0" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex touch-none items-end justify-center">
          <Drawer.Popup
            className={cn(
              // Monte depuis le bas à l'ouverture, suit le doigt pendant le glissement
              "group/sheet relative flex h-[calc(100dvh-1rem)] min-h-0 w-full max-w-[28rem] [transform:translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] touch-none flex-col rounded-t-2xl bg-popover [padding-bottom:max(0px,calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] text-sm text-popover-foreground shadow-lg transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-ending-style:[transform:translateY(calc(100%+2px))] data-ending-style:[padding-bottom:0] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:[transform:translateY(calc(100%+2px))] data-starting-style:[padding-bottom:0] data-swiping:select-none",
              className,
            )}
          >
            {/* Poignée : se saisit pour monter ou descendre le panneau */}
            <div className="shrink-0 touch-none pt-2 pb-1 select-none">
              <span
                aria-hidden
                className="mx-auto block h-1 w-10 rounded-full bg-muted-foreground/30"
              />
            </div>
            {/* À mi-hauteur, le contenu ne défile pas : le geste vers le haut
                étend le panneau. Une fois étendu, le contenu défile. */}
            <Drawer.Content
              onWheel={(e) => {
                const now = Date.now();
                if (now - lastWheelChange.current < WHEEL_PAUSE_MS) {
                  // Le même geste continue : il ne compte pas une deuxième fois
                  lastWheelChange.current = now;
                  return;
                }
                if (e.deltaY > 0) {
                  if (snapPoint !== FULL) {
                    lastWheelChange.current = now;
                    setSnapPoint(FULL);
                  }
                  return;
                }
                // Vers le bas, une fois le contenu revenu en haut : le panneau
                // redescend à mi-hauteur, puis se ferme
                if (e.deltaY < 0 && e.currentTarget.scrollTop <= 0) {
                  lastWheelChange.current = now;
                  if (snapPoint === FULL) setSnapPoint(HALF);
                  else onOpenChange(false);
                }
              }}
              className="min-h-0 flex-1 touch-none overflow-hidden overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))] group-data-expanded/sheet:touch-auto group-data-expanded/sheet:overflow-y-auto"
            >
              {children}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const BottomSheetTitle = Drawer.Title;
export const BottomSheetClose = Drawer.Close;
