"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { MemberPage } from "@/modules/pages";
import { CaretDownIcon, CheckIcon } from "@/shared/components/icons";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

/**
 * Page gérée, et passage d'une page à l'autre pour qui est membre de
 * plusieurs : l'espace organisateur agit toujours au nom d'une seule page.
 */
export function PageSwitcher({
  current,
  pages,
}: {
  current: MemberPage;
  pages: MemberPage[];
}) {
  const t = useTranslations();
  const others = pages.length > 1;
  const identity = (
    <>
      <ProfileAvatar name={current.name} photo={current.photoUrl} size="md" />
      <span className="grid min-w-0 text-left leading-tight">
        <span className="truncate text-xl font-semibold tracking-tight">
          {current.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {t(`pages.roles.${current.role}`)}
        </span>
      </span>
    </>
  );
  if (!others) {
    return <div className="flex min-w-0 items-center gap-3">{identity}</div>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("studio.switchPage", { name: current.name })}
        className="-ml-2 flex min-w-0 items-center gap-3 rounded-lg py-1 pr-2 pl-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {identity}
        <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-64">
        {pages.map((page) => {
          const active = page.slug === current.slug;
          return (
            <DropdownMenuItem
              key={page.id}
              render={
                <Link href={`/studio/${encodeURIComponent(page.slug)}`} />
              }
              className="gap-3 py-2"
            >
              <ProfileAvatar name={page.name} photo={page.photoUrl} size="sm" />
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className={cn("truncate", active && "font-semibold")}>
                  {page.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t(`pages.roles.${page.role}`)}
                </span>
              </span>
              {active && <CheckIcon className="size-4" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/my-pages" />}>
          {t("studio.allPages")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
