import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/** Classes d'un segment (bouton ou lien) d'un contrôle segmenté. */
export const SEGMENT_CLASS =
  "relative grid min-h-11 place-items-center rounded-full px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=true]:text-foreground aria-pressed:text-foreground";

/**
 * Contrôle segmenté de verre : un rail et un curseur qui glisse sous le
 * segment actif (`index`, -1 = aucun). Les segments portent eux-mêmes leur
 * rôle (aria-pressed ou aria-current) : ce cadre n'est qu'un groupe.
 */
export function Segmented({
  label,
  index,
  count,
  className,
  children,
}: {
  label: string;
  index: number;
  count: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("ct-segmented", className)}
      style={{ "--count": count, "--index": index } as CSSProperties}
    >
      {index >= 0 && <span aria-hidden className="ct-segmented__thumb" />}
      {children}
    </div>
  );
}
