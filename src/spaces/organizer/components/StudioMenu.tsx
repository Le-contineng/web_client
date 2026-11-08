"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowSquareOutIcon,
  ChartBarIcon,
  DotsThreeVerticalIcon,
  GearIcon,
  UsersIcon,
} from "@/shared/components/icons";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export type StudioSection = "events" | "audience" | "team" | "page";

/**
 * Menu « plus » de l'espace organisateur : les rubriques Audience et
 * Équipe, la page publique et, pour le propriétaire, ses paramètres.
 */
export function StudioMenu({
  slug,
  owner,
  section,
}: {
  slug: string;
  owner: boolean;
  section: StudioSection;
}) {
  const t = useTranslations("studio");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("more")}
            className="shrink-0"
          />
        }
      >
        <DotsThreeVerticalIcon weight="bold" className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem
          render={<Link href={`/studio/${slug}/audience`} />}
          aria-current={section === "audience" ? "page" : undefined}
        >
          <ChartBarIcon />
          {t("sections.audience")}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={`/studio/${slug}/equipe`} />}
          aria-current={section === "team" ? "page" : undefined}
        >
          <UsersIcon />
          {t("sections.team")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={`/p/${slug}`} />}>
          <ArrowSquareOutIcon />
          {t("viewPublic")}
        </DropdownMenuItem>
        {owner && (
          <DropdownMenuItem render={<Link href={`/studio/${slug}/profil`} />}>
            <GearIcon />
            {t("settings")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
