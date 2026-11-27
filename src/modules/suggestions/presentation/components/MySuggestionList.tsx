import { useFormatter, useTranslations } from "next-intl";
import type {
  Suggestion,
  SuggestionList,
} from "@/modules/suggestions/domain/suggestion.types";
import { SuggestionPagination } from "@/modules/suggestions/presentation/components/SuggestionPagination";
import { SuggestionStatusBadge } from "@/modules/suggestions/presentation/components/SuggestionStatusBadge";

/**
 * « Mes suggestions » : celles que la personne a laissées, avec leur état et
 * la réponse de la page. `pageNames` donne le nom de chaque page par id.
 */
export function MySuggestionList({
  list,
  pageNames,
  basePath,
}: {
  list: SuggestionList;
  pageNames: Record<string, string>;
  basePath: string;
}) {
  const t = useTranslations("suggestions");
  if (list.total === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        {t("mineEmpty")}
      </p>
    );
  }
  return (
    <div className="grid gap-4">
      <ul className="grid gap-3">
        {list.suggestions.map((s) => (
          <li key={s.id}>
            <MySuggestion suggestion={s} pageName={pageNames[s.pageId]} />
          </li>
        ))}
      </ul>
      <SuggestionPagination list={list} basePath={basePath} />
    </div>
  );
}

function MySuggestion({
  suggestion: s,
  pageName,
}: {
  suggestion: Suggestion;
  pageName: string | undefined;
}) {
  const t = useTranslations("suggestions");
  const format = useFormatter();
  return (
    <article className="grid gap-3 rounded-xl border p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="grid min-w-0">
          <span className="truncate font-semibold">
            {pageName ?? t("unknownPage")}
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
        </div>
        <SuggestionStatusBadge suggestion={s} />
      </header>
      <p className="text-sm whitespace-pre-line">{s.content}</p>
      {s.answer && (
        <div className="grid gap-1 rounded-lg bg-muted p-3">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("answerFrom", { page: pageName ?? t("unknownPage") })}
          </span>
          <p className="text-sm whitespace-pre-line">{s.answer.content}</p>
        </div>
      )}
    </article>
  );
}
