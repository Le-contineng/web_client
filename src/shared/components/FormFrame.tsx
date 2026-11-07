import type { ReactNode } from "react";
import { ActionBar } from "@/shared/components/ActionBar";
import { cn } from "@/shared/lib/utils";

/**
 * Cadre d'un écran de formulaire. Avec un titre (dans un modal) : en-tête
 * fixe au titre centré et bien visible, séparé par un trait, contenu qui
 * défile, pied fixe (sans trait) pour les boutons. Sans titre (en page, qui a déjà le
 * sien) : les mêmes blocs, simplement empilés.
 */
export function FormFrame({
  title,
  children,
  footer,
}: {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const framed = !!title;
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", !framed && "gap-5")}>
      {framed && (
        // Marges latérales : la croix du modal est dans l'angle droit
        <header className="shrink-0 border-b px-14 py-4 text-center">
          <h1 className="text-lg font-bold">{title}</h1>
        </header>
      )}
      {/* Le pied est dans la zone qui défile, collé en bas : même largeur que le
          contenu, donc aligné sur lui quelle que soit la barre de défilement */}
      <div className={cn(framed && "min-h-0 flex-1 overflow-y-auto")}>
        <div
          className={cn("grid content-start gap-5", framed && "px-5 pt-5 pb-3")}
        >
          {children}
        </div>
        {footer && !framed && <ActionBar>{footer}</ActionBar>}
        {footer && framed && (
          <footer
            // Fondu au-dessus : le contenu glisse sous le pied sans coupure sèche
            className="sticky bottom-0 bg-popover px-5 pt-2 pb-5 before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-popover before:to-transparent"
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
