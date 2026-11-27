import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  pageCount,
  type SuggestionList,
} from "@/modules/suggestions/domain/suggestion.types";
import { buttonVariants } from "@/shared/ui/button";

/** Pages précédente et suivante d'une liste, 20 suggestions par page. */
export function SuggestionPagination({
  list,
  basePath,
}: {
  list: SuggestionList;
  /** Adresse de la liste, avec ses filtres éventuels (sans `page`). */
  basePath: string;
}) {
  const t = useTranslations("suggestions");
  const pages = pageCount(list);
  if (pages <= 1) return null;
  const href = (page: number) =>
    `${basePath}${basePath.includes("?") ? "&" : "?"}page=${page}`;
  const secondary = buttonVariants({ variant: "secondary", size: "sm" });
  return (
    <nav
      aria-label={t("pagination")}
      className="flex items-center justify-between gap-2"
    >
      {list.page > 0 ? (
        <Link href={href(list.page - 1)} className={secondary}>
          {t("previous")}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted-foreground">
        {t("pageOf", { page: list.page + 1, pages })}
      </span>
      {list.page + 1 < pages ? (
        <Link href={href(list.page + 1)} className={secondary}>
          {t("next")}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
