/** Où en est une suggestion du côté de la page : aucun membre ne l'a ouverte, ou l'un d'eux l'a lue. */
export const SUGGESTION_STATUSES = ["new", "read"] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

/** Réponse de la page, donnée une seule fois et définitive. */
export type SuggestionAnswer = { content: string; answeredAt: string };

/** Auteur d'une suggestion, tel que l'API le montre aux membres de la page. */
export type SuggestionAuthor = { name: string; photoUrl: string | null };

/**
 * Suggestion laissée à une page, telle que l'API la renvoie (dates UTC,
 * ISO 8601). Jamais anonyme pour les membres de la page : `author` donne
 * son nom et sa photo (null dans « Mes suggestions », ou compte supprimé).
 */
export type Suggestion = {
  id: string;
  pageId: string;
  authorId: string;
  author: SuggestionAuthor | null;
  content: string;
  status: SuggestionStatus;
  submittedAt: string;
  answer: SuggestionAnswer | null;
};

/** Une page de liste : 20 suggestions au plus, les plus récentes d'abord. */
export type SuggestionList = {
  suggestions: Suggestion[];
  page: number;
  size: number;
  total: number;
};

/** Limites vérifiées par l'API ; le front les reprend pour guider la saisie. */
export const SUGGESTION_LIMITS = {
  contentMin: 10,
  contentMax: 1000,
  answerMin: 1,
  answerMax: 1000,
} as const;

/** Longueur en caractères (un émoji compte pour un), espaces de bord retirés. */
export function textLength(text: string): number {
  return [...text.trim()].length;
}

/** Code d'erreur `errors.*` d'une suggestion trop courte ou trop longue, sinon null. */
export function suggestionError(content: string): string | null {
  const n = textLength(content);
  return n < SUGGESTION_LIMITS.contentMin || n > SUGGESTION_LIMITS.contentMax
    ? "suggestionLength"
    : null;
}

/** Code d'erreur d'une réponse vide ou trop longue, sinon null. */
export function answerError(content: string): string | null {
  const n = textLength(content);
  return n < SUGGESTION_LIMITS.answerMin || n > SUGGESTION_LIMITS.answerMax
    ? "answerLength"
    : null;
}

/** Filtre de la liste d'une page, lu dans l'adresse (`?status=`). */
export function readStatusFilter(value: unknown): SuggestionStatus | null {
  return typeof value === "string" &&
    (SUGGESTION_STATUSES as readonly string[]).includes(value)
    ? (value as SuggestionStatus)
    : null;
}

/** Numéro de page lu dans l'adresse (`?page=`), à partir de 0. */
export function readPageIndex(value: unknown): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Nombre de pages d'une liste, au moins une. */
export function pageCount(
  list: Pick<SuggestionList, "size" | "total">,
): number {
  return Math.max(1, Math.ceil(list.total / list.size));
}
