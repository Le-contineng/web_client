"use client";

import {
  ChartLineUpIcon,
  GridNineIcon,
  type Icon,
  UsersIcon,
} from "@/shared/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { Role } from "@/modules/pages/domain/page.types";

type Tab = {
  key: "events" | "followers" | "access";
  href: string;
  Icon: Icon;
};

/**
 * Onglets d'une de mes pages, sous l'en-tête : ses publications et, pour le
 * propriétaire seulement, les accès (US-06) ; les abonnés pour tous les
 * membres (ADR 0020). L'onglet
 * actif est souligné, au-dessus de la ligne de séparation.
 */
export function MyPageTabs({ slug, role }: { slug: string; role: Role }) {
  const t = useTranslations("pages.myPages");
  const path = usePathname();
  const base = `/my-pages/${slug}`;
  const tabs: Tab[] = [
    { key: "events", href: base, Icon: GridNineIcon },
    { key: "followers", href: `${base}/followers`, Icon: ChartLineUpIcon },
    ...(role === "owner"
      ? [{ key: "access" as const, href: `${base}/access`, Icon: UsersIcon }]
      : []),
  ];
  return (
    <nav
      className="flex justify-center gap-10 border-b sm:gap-16"
      aria-label={t("title")}
    >
      {tabs.map(({ key, href, Icon }) => (
        <Link
          key={key}
          href={href}
          aria-current={path === href ? "page" : undefined}
          className={cn(
            "-mb-px flex items-center gap-1.5 border-b-2 border-transparent py-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase hover:text-foreground",
            path === href && "border-foreground text-foreground",
          )}
        >
          <Icon className="size-4 sm:size-3.5" />
          <span className="hidden sm:inline">{t(key)}</span>
          <span className="sr-only sm:hidden">{t(key)}</span>
        </Link>
      ))}
    </nav>
  );
}
