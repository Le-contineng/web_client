"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  submitSuggestionAction,
  type SuggestionFormState,
} from "@/modules/suggestions/application/suggestions.actions";
import {
  SUGGESTION_LIMITS,
  textLength,
} from "@/modules/suggestions/domain/suggestion.types";
import { FormField } from "@/shared/components/FormField";
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useErrorMessages } from "@/shared/i18n/errors";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

/** Formulaire de dépôt d'une suggestion (10 à 1000 caractères). */
export function SuggestionForm({
  pageId,
  onSent,
}: {
  pageId: string;
  onSent: () => void;
}) {
  const t = useTranslations("suggestions");
  const errors = useErrorMessages();
  const [content, setContent] = useState("");
  const { state, onSubmit, enCours, action } =
    useFormAction<SuggestionFormState>(submitSuggestionAction, {});

  // Une seule fois par envoi réussi, même si le parent se rend à nouveau
  const handled = useRef<SuggestionFormState | null>(null);
  useEffect(() => {
    if (!state.sent || handled.current === state) return;
    handled.current = state;
    onSent();
  }, [state, onSent]);

  const length = textLength(content);
  return (
    <form action={action} onSubmit={onSubmit} className="grid gap-4" noValidate>
      <input type="hidden" name="pageId" value={pageId} />
      <FormField
        id="suggestion-content"
        label={t("contentLabel")}
        error={errors(state.fieldErrors?.content)}
      >
        <Textarea
          id="suggestion-content"
          name="content"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("contentPlaceholder")}
          aria-invalid={!!state.fieldErrors?.content}
          aria-describedby="suggestion-count"
        />
      </FormField>
      <p
        id="suggestion-count"
        className="-mt-2 text-right text-xs text-muted-foreground"
      >
        {t("count", { n: length, max: SUGGESTION_LIMITS.contentMax })}
      </p>
      {state.error && !state.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {errors(state.error)}
        </p>
      )}
      <Button type="submit" disabled={enCours}>
        {t("submit")}
      </Button>
    </form>
  );
}
