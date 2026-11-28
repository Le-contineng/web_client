import "server-only";
import { cache } from "react";
import { ApiError } from "@/shared/api/client";
import { suggestionsApi } from "@/modules/suggestions/infrastructure/suggestions.api";

export type {
  Suggestion,
  SuggestionList,
  SuggestionStatus,
} from "@/modules/suggestions/domain/suggestion.types";

// ——— Lecture publique ———
/** La boîte de la page est-elle ouverte ? Fermée par prudence si l'API ne répond pas. */
export const isSuggestionBoxOpen = cache(async (pageId: string) => {
  try {
    return (await suggestionsApi.box(pageId)).open;
  } catch {
    return false;
  }
});

// ——— Personne connectée ———
export const getMySuggestions = (page = 0) => suggestionsApi.mine(page);
export const submitSuggestion = suggestionsApi.submit;

// ——— Membres de la page ———
export const getPageSuggestions = suggestionsApi.ofPage;
/** Nombre de suggestions non lues ; 0 si l'API refuse ou ne répond pas. */
export const getUnreadSuggestionCount = cache(async (pageId: string) => {
  try {
    return (await suggestionsApi.unreadCount(pageId)).count;
  } catch {
    return 0;
  }
});
/** Détail d'une suggestion (la marque lue), ou null si elle n'est pas de la page. */
export async function openSuggestion(pageId: string, id: string) {
  try {
    return await suggestionsApi.open(pageId, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
export const answerSuggestion = suggestionsApi.answer;
export const setSuggestionBox = suggestionsApi.setBox;
