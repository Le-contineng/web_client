"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";

/**
 * Onglets du fil, façon X / TikTok : « Tout » et, avec un compte,
 * « Abonnements ». L'onglet actif est souligné en rouge.
 */
export function FeedTabs({
  withFollowing,
  className,
}: {
  withFollowing: boolean;
  className?: string;
}) {
  const t = useTranslations("events");
  const path = usePathname();
  return (
    <nav
      className={cn("flex items-center", className)}
      aria-label={t("listTitle")}
    >
      <FeedTab href="/" active={path === "/"}>
        {t("feedTabs.all")}
      </FeedTab>
      {withFollowing && (
        <FeedTab href="/following" active={path === "/following"}>
          {t("feedTabs.following")}
        </FeedTab>
      )}
    </nav>
  );
}

function FeedTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="flex h-full flex-1 items-center justify-center px-3 text-[15px] outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
    >
      <span
        className={cn(
          "relative flex h-full items-center whitespace-nowrap",
          active
            ? "font-bold text-foreground"
            : "font-medium text-muted-foreground",
        )}
      >
        {children}
        {active && (
          <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-brand" />
        )}
      </span>
    </Link>
  );
}
