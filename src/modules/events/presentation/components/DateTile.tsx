"use client";

import { useLocale } from "next-intl";
import { useMounted } from "@/shared/hooks/useMounted";
import { cn } from "@/shared/lib/utils";

/**
 * Tuile « OCT / 05 » posée sur le coin de l'image, façon billet. Le jour
 * dépend du fuseau de l'appareil (D7) : rendue dans le navigateur.
 */
export function DateTile({
  iso,
  size = "md",
  tone = "brand",
  className,
}: {
  iso: string;
  /** « sm » : tuile réduite de la carte du fil. */
  size?: "md" | "sm";
  /**
   * « ink » : mois en gris sur papier blanc, pour les listes de gestion où la
   * bande fuchsia se répéterait à chaque ligne.
   */
  tone?: "brand" | "ink";
  className?: string;
}) {
  const mounted = useMounted();
  const locale = useLocale() === "fr" ? "fr-FR" : "en-US";
  const date = new Date(iso);
  const month = new Intl.DateTimeFormat(locale, { month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
  const day = new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date);
  return (
    <time
      dateTime={iso}
      aria-hidden
      className={cn(
        // Le jour occupe la hauteur restante : la tuile peut s'étirer sur le texte voisin
        "grid grid-rows-[auto_1fr] overflow-hidden rounded-[4px] border bg-card text-center leading-none",
        size === "sm" ? "w-11" : "w-14",
        className,
      )}
    >
      <span
        className={cn(
          "font-bold tracking-wider",
          tone === "brand"
            ? "bg-primary text-primary-foreground"
            : "border-b bg-muted text-muted-foreground",
          size === "sm" ? "py-1 text-[10px]" : "py-1.5 text-[11px]",
        )}
      >
        {mounted ? month : " "}
      </span>
      <span
        className={cn(
          "grid place-items-center font-bold tabular-nums",
          size === "sm" ? "py-1 text-lg" : "py-1.5 text-2xl",
        )}
      >
        {mounted ? day : " "}
      </span>
    </time>
  );
}
