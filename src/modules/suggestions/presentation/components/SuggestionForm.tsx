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
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useErrorMessages } from "@/shared/i18n/errors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

/**
 * Formulaire de dépôt d'une suggestion (10 à 1000 caractères) : un champ qui
 * grandit avec le texte, le compteur en direct, puis « Annuler » et
 * « Envoyer » (pleine largeur sur téléphone).
 */
export function SuggestionForm({
  pageId,
  onSent,
  onCancel,
}: {
  pageId: string;
  onSent: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations();
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
  const tooShort = length < SUGGESTION_LIMITS.contentMin;
  const tooLong = length > SUGGESTION_LIMITS.contentMax;
  const fieldError = errors(state.fieldErrors?.content);
  return (
    <form action={action} onSubmit={onSubmit} className="grid gap-5" noValidate>
      <input type="hidden" name="pageId" value={pageId} />
      <div className="grid gap-2">
        <Label htmlFor="suggestion-content">
          {t("suggestions.contentLabel")}
        </Label>
        <Textarea
          id="suggestion-content"
          name="content"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("suggestions.contentPlaceholder")}
          aria-invalid={!!state.fieldErrors?.content}
          aria-describedby="suggestion-help"
          // Grandit avec le texte, sans dépasser la moitié de l'écran ; 16 px
          // sur téléphone pour que le navigateur ne zoome pas au focus
          className="[field-sizing:content] max-h-[50dvh] min-h-36 resize-none text-base sm:text-sm"
        />
        <div
          id="suggestion-help"
          className="flex items-start justify-between gap-3 text-xs"
        >
          <span
            className={
              fieldError ? "text-destructive" : "text-muted-foreground"
            }
          >
            {fieldError ?? t("suggestions.lengthHint")}
          </span>
          <span
            aria-live="polite"
            className={cn(
              "shrink-0 tabular-nums",
              tooLong
                ? "font-semibold text-destructive"
                : tooShort
                  ? "text-muted-foreground"
                  : "text-foreground",
            )}
          >
            {t("suggestions.count", {
              n: length,
              max: SUGGESTION_LIMITS.contentMax,
            })}
          </span>
        </div>
      </div>
      {state.error && !state.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {errors(state.error)}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={enCours || tooShort || tooLong}
          className="max-sm:h-11 max-sm:w-full"
        >
          {t("suggestions.submit")}
        </Button>
      </div>
    </form>
  );
}
