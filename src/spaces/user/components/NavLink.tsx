"use client";

import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SIDEBAR_LABEL } from "@/spaces/user/components/sidebar-classes";
import { useSidebarPanel } from "@/spaces/user/components/sidebar-panel";

/** Entrée de navigation : barre latérale (icône + libellé) ou barre basse (icône). */
export function NavLink({
  href,
  icon,
  activeIcon,
  label,
  variant,
}: {
  href: string;
  icon: ReactNode;
  /** Icône pleine de l'onglet actif, comme sur les réseaux sociaux. */
  activeIcon?: ReactNode;
  label: string;
  variant: "sidebar" | "bottom";
}) {
  const path = usePathname();
  const { panel } = useSidebarPanel();
  const onPage = href === "/" ? path === "/" : path.startsWith(href);
  // Un tiroir ouvert (notifications, « Plus ») devient l'onglet actif.
  const active = onPage && !(variant === "sidebar" && panel);
  const shownIcon = active && activeIcon ? activeIcon : icon;
  if (variant === "bottom") {
    // Sur téléphone, connexion, inscription et création s'ouvrent en page
    // entière : un lien classique n'est pas intercepté en modal (@auth, @modal).
    const Anchor = opensAsPage(href) ? "a" : Link;
    return (
      <Anchor
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "grid flex-1 place-items-center py-3 [&_svg]:size-6",
          active ? "text-brand" : "text-foreground/80",
        )}
      >
        {shownIcon}
      </Anchor>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-base transition-colors hover:bg-muted [&_svg]:size-6 [&_svg]:shrink-0",
        active && "font-semibold text-brand",
      )}
    >
      {shownIcon}
      <span className={SIDEBAR_LABEL}>{label}</span>
    </Link>
  );
}

/**
 * Écran ouvert en modal sur ordinateur et en page sur téléphone
 * (/login, /register, /events/new…), adresse et paramètres compris.
 */
function opensAsPage(href: string) {
  return /^\/(login|register|forgot-password|events\/new)(\?|$)/.test(href);
}
