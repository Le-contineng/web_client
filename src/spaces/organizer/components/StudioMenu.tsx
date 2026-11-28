"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowSquareOutIcon,
  ChartBarIcon,
  ChatBubbleIcon,
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

export type StudioSection =
  "events" | "audience" | "team" | "page" | "suggestions";

/**
 * Menu « plus » de l'espace organisateur : les rubriques Audience et
 * Équipe, la page publique et, pour le propriétaire, ses paramètres.
 */
export function StudioMenu({
  slug,
  owner,
  section,
  unreadSuggestions = 0,
}: {
  slug: string;
  owner: boolean;
  section: StudioSection;
  /** Suggestions qu'aucun membre n'a encore ouvertes. */
  unreadSuggestions?: number;
}) {
  const t = useTranslations("studio");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              unreadSuggestions > 0
                ? t("moreWithUnread", { n: unreadSuggestions })
                : t("more")
            }
            className="relative shrink-0"
          />
        }
      >
        <DotsThreeVerticalIcon weight="bold" className="size-5" />
        {unreadSuggestions > 0 && (
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary"
          />
        )}
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
        <DropdownMenuItem
          render={<Link href={`/studio/${slug}/suggestions`} />}
          aria-current={section === "suggestions" ? "page" : undefined}
        >
          <ChatBubbleIcon />
          <span className="flex-1">{t("sections.suggestions")}</span>
          {unreadSuggestions > 0 && (
            <span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-xs font-semibold text-primary-foreground">
              <span className="sr-only">
                {t("unreadSuggestions", { n: unreadSuggestions })}
              </span>
              <span aria-hidden>
                {unreadSuggestions > 99 ? "99+" : unreadSuggestions}
              </span>
            </span>
          )}
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
