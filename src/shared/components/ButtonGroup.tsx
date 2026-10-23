import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/** Conteneur de verre pour des boutons voisins (Partager + Copier le lien). */
export function ButtonGroup({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="button-group"
      className={cn("ct-glass ct-btn-group w-fit max-w-full", className)}
    >
      {children}
    </div>
  );
}
