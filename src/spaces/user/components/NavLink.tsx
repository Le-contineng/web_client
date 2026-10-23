"use client";

import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SIDEBAR_LABEL } from "@/spaces/user/components/sidebar-classes";
import { useSidebarPanel } from "@/spaces/user/components/sidebar-panel";

/**
 * Onglet actif : icône pleine. Les traits intérieurs des icônes carrées
 * (le « + » de Créer) passent en couleur de fond pour rester visibles.
 */
const ACTIVE_ICON = "[&_svg]:fill-current [&_svg_rect~path]:stroke-background";

/** Entrée de navigation : barre latérale ou barre d'onglets (icône + libellé). */
export function NavLink({
  href,
  icon,
  label,
  variant,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  variant: "sidebar" | "bottom";
}) {
  const path = usePathname();
  const { panel } = useSidebarPanel();
  const onPage = href === "/" ? path === "/" : path.startsWith(href);
  // Un tiroir ouvert (notifications, « Plus ») devient l'onglet actif.
  const active = onPage && !(variant === "sidebar" && panel);
  if (variant === "bottom") {
    return (
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "ct-tab ct-press outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-6",
          active && ACTIVE_ICON,
        )}
      >
        {icon}
        <span className="ct-tab__label max-w-full truncate px-1">{label}</span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-full px-3 text-base transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-6 [&_svg]:shrink-0",
        active &&
          cn(
            "bg-ct-blue-soft font-semibold text-ct-blue-label shadow-[inset_0_0_0_1px_rgb(47_160_193/0.24)] hover:bg-ct-blue-soft",
            ACTIVE_ICON,
          ),
      )}
    >
      {icon}
      <span className={SIDEBAR_LABEL}>{label}</span>
    </Link>
  );
}
