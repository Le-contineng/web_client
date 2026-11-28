"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { answerSuggestionAction } from "@/modules/suggestions/application/suggestions.actions";
import {
  SUGGESTION_LIMITS,
  textLength,
} from "@/modules/suggestions/domain/suggestion.types";
import { FormField } from "@/shared/components/FormField";
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useErrorMessages } from "@/shared/i18n/errors";
import type { FormState } from "@/shared/lib/form";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

/**
 * Réponse à une suggestion : une seule, définitive. La page est relue après
 * l'envoi et montre alors la réponse à la place du formulaire.
 */
export function AnswerForm({
  pageId,
  suggestionId,
}: {
  pageId: string;
  suggestionId: string;
}) {
  const t = useTranslations("suggestions");
  const errors = useErrorMessages();
  const [content, setContent] = useState("");
  const { state, onSubmit, enCours, action } = useFormAction<FormState>(
    answerSuggestionAction,
    {},
  );
  return (
    <form action={action} onSubmit={onSubmit} className="grid gap-3" noValidate>
      <input type="hidden" name="pageId" value={pageId} />
      <input type="hidden" name="id" value={suggestionId} />
      <FormField
        id="answer-content"
        label={t("answerLabel")}
        error={errors(state.fieldErrors?.content)}
      >
        <Textarea
          id="answer-content"
          name="content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-invalid={!!state.fieldErrors?.content}
          aria-describedby="answer-hint"
        />
      </FormField>
      <p id="answer-hint" className="-mt-1 text-xs text-muted-foreground">
        {t("answerFinal")} ·{" "}
        {t("count", {
          n: textLength(content),
          max: SUGGESTION_LIMITS.answerMax,
        })}
      </p>
      {state.error && !state.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {errors(state.error)}
        </p>
      )}
      <Button type="submit" disabled={enCours} className="w-fit">
        {t("answerSubmit")}
      </Button>
    </form>
  );
}
