import type { ReactNode } from "react";

/**
 * Barre de l'action principale d'un formulaire : collée en bas de l'écran
 * sur téléphone, à portée du pouce ; à la fin du formulaire sur ordinateur.
 */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    // Au-dessus de la barre de navigation du bas quand elle est là (--bottom-nav, globals.css)
    <div className="sticky bottom-[var(--bottom-nav,0px)] z-10 -mx-4 mt-1 flex items-center gap-2 border-t bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:mt-2 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none [&>*]:flex-1 sm:[&>*]:flex-none">
      {children}
    </div>
  );
}
