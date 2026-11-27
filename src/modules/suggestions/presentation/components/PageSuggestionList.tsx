import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import type {
  SuggestionList,
  SuggestionStatus,
} from "@/modules/suggestions/domain/suggestion.types";
import { SuggestionPagination } from "@/modules/suggestions/presentation/components/SuggestionPagination";
import { SuggestionStatusBadge } from "@/modules/suggestions/presentation/components/SuggestionStatusBadge";
import { cn } from "@/shared/lib/utils";

const FILTERS = [null, "new", "read"] as const;

/**
 * Boîte à suggestions d'une page, côté membres : filtres (toutes, nouvelles,
 * lues), puis les suggestions, les plus récentes d'abord. Ouvrir une
 * suggestion la marque lue.
 */
export function PageSuggestionList({
  list,
  status,
  basePath,
}: {
  list: SuggestionList;
  status: SuggestionStatus | null;
  /** Adresse de la boîte, ex. `/studio/club/suggestions`. */
  basePath: string;
}) {
  const t = useTranslations("suggestions");
  const format = useFormatter();
  const filtered = status ? `${basePath}?status=${status}` : basePath;
  return (
    <div className="grid gap-4">
      <nav aria-label={t("filter")} className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f ?? "all"}
            href={f ? `${basePath}?status=${f}` : basePath}
            aria-current={f === status ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              f === status
                ? "bg-ink text-ink-foreground"
                : "bg-muted hover:bg-muted/70",
            )}
          >
            {t(`filters.${f ?? "all"}`)}
          </Link>
        ))}
      </nav>
      {list.total === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t(status ? `empty.${status}` : "empty.all")}
        </p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {list.suggestions.map((s) => (
            <li key={s.id}>
              <Link
                href={`${basePath}/${s.id}`}
                // Ouvrir la marque lue : jamais de préchargement
                prefetch={false}
                className="flex items-start gap-3 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    s.status === "new" ? "bg-primary" : "bg-transparent",
                  )}
                />
                <span className="grid min-w-0 flex-1 gap-1">
                  <span
                    className={cn(
                      "line-clamp-2 text-sm",
                      s.status === "new" && "font-semibold",
                    )}
                  >
                    {s.content}
                  </span>
                  <time
                    dateTime={s.submittedAt}
                    className="text-xs text-muted-foreground"
                  >
                    {format.dateTime(new Date(s.submittedAt), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </span>
                <SuggestionStatusBadge suggestion={s} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <SuggestionPagination list={list} basePath={filtered} />
    </div>
  );
}
