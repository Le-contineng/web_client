"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAccount } from "@/modules/authentication/server";
import { getMyPageById } from "@/modules/pages/server";
import {
  answerError,
  SUGGESTION_LIMITS,
  suggestionError,
} from "@/modules/suggestions/domain/suggestion.types";
import {
  answerSuggestion,
  setSuggestionBox,
  submitSuggestion,
} from "@/modules/suggestions/server";
import { catchApiError } from "@/shared/api/errors";
import {
  type FormState,
  idField,
  parseForm,
  textField,
} from "@/shared/lib/form";

/** État d'un formulaire de suggestion : `sent` une fois la suggestion déposée. */
export type SuggestionFormState = FormState & { sent?: boolean };

/**
 * Déposer une suggestion (compte connecté, non membre de la page). L'API
 * revérifie tout : boîte ouverte, limite de 3 par 24 h, longueur.
 */
export async function submitSuggestionAction(
  _: SuggestionFormState,
  formData: FormData,
): Promise<SuggestionFormState> {
  const f = parseForm(
    { pageId: idField, content: textField(SUGGESTION_LIMITS.contentMax * 4) },
    formData,
  );
  if (!f) return { error: "invalidInput" };
  if (!(await getCurrentAccount())) return { error: "loginRequired" };
  const invalid = suggestionError(f.content);
  if (invalid) return { error: invalid, fieldErrors: { content: invalid } };
  if (await getMyPageById(f.pageId)) return { error: "ownPageSuggestion" };
  const result = await catchApiError(() =>
    submitSuggestion(f.pageId, f.content.trim()),
  );
  if (!result.ok) return result.state;
  revalidatePath("/my-suggestions");
  return { sent: true };
}

/** Répondre à une suggestion, une seule fois (membre de la page). */
export async function answerSuggestionAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const f = parseForm(
    {
      pageId: idField,
      id: idField,
      content: textField(SUGGESTION_LIMITS.answerMax * 4),
    },
    formData,
  );
  if (!f) return { error: "invalidInput" };
  const page = await getMyPageById(f.pageId);
  if (!page) return { error: "accessDenied" };
  const invalid = answerError(f.content);
  if (invalid) return { error: invalid, fieldErrors: { content: invalid } };
  const result = await catchApiError(() =>
    answerSuggestion(f.pageId, f.id, f.content.trim()),
  );
  if (!result.ok) return result.state;
  revalidatePath(`/studio/${page.slug}/suggestions`, "layout");
  return {};
}

const boxSchema = z.object({ pageId: idField, open: z.boolean() });

/** Ouvrir ou fermer la boîte (propriétaire seulement). */
export async function setSuggestionBoxAction(
  pageId: string,
  open: boolean,
): Promise<{ ok: true; open: boolean } | { ok: false; error: string }> {
  const f = boxSchema.safeParse({ pageId, open });
  if (!f.success) return { ok: false, error: "invalidInput" };
  const page = await getMyPageById(f.data.pageId);
  if (page?.role !== "owner") return { ok: false, error: "accessDenied" };
  const result = await catchApiError(() =>
    setSuggestionBox(f.data.pageId, f.data.open),
  );
  if (!result.ok) return { ok: false, error: result.state.error ?? "unknown" };
  revalidatePath(`/p/${page.slug}`);
  revalidatePath(`/studio/${page.slug}/suggestions`);
  return { ok: true, open: result.value.open };
}
