import { useFormatter, useTranslations } from "next-intl";
import type { Suggestion } from "@/modules/suggestions/domain/suggestion.types";
import { AnswerForm } from "@/modules/suggestions/presentation/components/AnswerForm";
import { SuggestionStatusBadge } from "@/modules/suggestions/presentation/components/SuggestionStatusBadge";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";

/**
 * Détail d'une suggestion pour les membres de la page : le texte, puis la
 * réponse si elle existe, sinon le formulaire pour répondre (une seule fois).
 */
export function SuggestionDetail({
  suggestion: s,
}: {
  suggestion: Suggestion;
}) {
  const t = useTranslations("suggestions");
  const format = useFormatter();
  const date = (iso: string) =>
    format.dateTime(new Date(iso), { dateStyle: "long", timeStyle: "short" });
  return (
    <div className="grid gap-5">
      <article className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <ProfileAvatar
              name={s.author?.name ?? "?"}
              photo={s.author?.photoUrl ?? null}
            />
            <div className="grid min-w-0">
              <span className="truncate font-semibold">
                {s.author?.name ?? t("deletedAccount")}
              </span>
              <time
                dateTime={s.submittedAt}
                className="text-sm text-muted-foreground"
              >
                {t("receivedOn", { date: date(s.submittedAt) })}
              </time>
            </div>
          </div>
          <SuggestionStatusBadge suggestion={s} />
        </div>
        <p className="whitespace-pre-line">{s.content}</p>
      </article>
      {s.answer ? (
        <section className="grid gap-1.5 rounded-xl bg-muted p-4">
          <h2 className="text-sm font-semibold">{t("yourAnswer")}</h2>
          <p className="text-sm whitespace-pre-line">{s.answer.content}</p>
          <time
            dateTime={s.answer.answeredAt}
            className="text-xs text-muted-foreground"
          >
            {t("answeredOn", { date: date(s.answer.answeredAt) })}
          </time>
        </section>
      ) : (
        <AnswerForm pageId={s.pageId} suggestionId={s.id} />
      )}
    </div>
  );
}
