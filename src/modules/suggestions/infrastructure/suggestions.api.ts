import "server-only";
import { api, translateApiError } from "@/shared/api/client";
import type {
  Suggestion,
  SuggestionList,
  SuggestionStatus,
} from "@/modules/suggestions/domain/suggestion.types";

/** Codes de l'API sans clé `errors.*` du même nom. */
const ERROR_CODES: Record<string, string> = {
  pageNotFound: "notFound",
  suggestionNotFound: "notFound",
};

async function translated<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    throw translateApiError(error, ERROR_CODES, {});
  }
}

const base = (pageId: string) => `/api/v1/pages/${encodeURIComponent(pageId)}`;

/**
 * Client du module `suggestions` de l'API Spring. L'API revérifie les droits
 * à chaque appel (membre, propriétaire, autrice) ; le front ne fait que
 * masquer ce qui ne servirait à rien.
 */
export const suggestionsApi = {
  /** Lecture publique : la page reçoit-elle des suggestions ? */
  box: (pageId: string) =>
    translated(() => api<{ open: boolean }>(`${base(pageId)}/suggestion-box`)),
  /** Ouvrir ou fermer la boîte (propriétaire seulement). */
  setBox: (pageId: string, open: boolean) =>
    translated(() =>
      api<{ open: boolean }>(`${base(pageId)}/suggestion-box`, {
        method: "PUT",
        body: { open },
      }),
    ),
  submit: (pageId: string, content: string) =>
    translated(() =>
      api<Suggestion>(`${base(pageId)}/suggestions`, {
        method: "POST",
        body: { content },
      }),
    ),
  /** Suggestions laissées par le compte connecté, 20 par page. */
  mine: (page = 0) =>
    translated(() =>
      api<SuggestionList>(`/api/v1/me/suggestions?page=${page}`),
    ),
  /** Suggestions reçues par la page (membres), les plus récentes d'abord. */
  ofPage: (pageId: string, status: SuggestionStatus | null, page = 0) =>
    translated(() =>
      api<SuggestionList>(
        `${base(pageId)}/suggestions?page=${page}${status ? `&status=${status}` : ""}`,
      ),
    ),
  unreadCount: (pageId: string) =>
    translated(() =>
      api<{ count: number }>(`${base(pageId)}/suggestions/unread-count`),
    ),
  /** Détail : l'ouvrir la marque lue pour toute la page. */
  open: (pageId: string, id: string) =>
    translated(() =>
      api<Suggestion>(`${base(pageId)}/suggestions/${encodeURIComponent(id)}`),
    ),
  answer: (pageId: string, id: string, content: string) =>
    translated(() =>
      api<Suggestion>(
        `${base(pageId)}/suggestions/${encodeURIComponent(id)}/answer`,
        { method: "PUT", body: { content } },
      ),
    ),
};
