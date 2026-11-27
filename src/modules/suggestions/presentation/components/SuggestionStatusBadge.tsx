import { useTranslations } from "next-intl";
import type { Suggestion } from "@/modules/suggestions/domain/suggestion.types";
import { Badge } from "@/shared/ui/badge";

/** État d'une suggestion : répondue, lue ou nouvelle. */
export function SuggestionStatusBadge({
  suggestion,
}: {
  suggestion: Pick<Suggestion, "status" | "answer">;
}) {
  const t = useTranslations("suggestions.status");
  if (suggestion.answer) return <Badge>{t("answered")}</Badge>;
  return (
    <Badge variant={suggestion.status === "new" ? "default" : "secondary"}>
      {t(suggestion.status)}
    </Badge>
  );
}
