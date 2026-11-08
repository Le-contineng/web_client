/**
 * Post d'un événement (ADR 0023) : un carrousel d'images et une légende
 * facultative, publié par la page organisatrice. Les posts n'expirent pas ;
 * en V1, on les consulte seulement.
 */
export type PostImage = {
  url: string;
  width: number;
  height: number;
  /** Aperçu flou : ThumbHash en base64. */
  placeholder: string | null;
  alt: string | null;
};

export type EventPost = {
  id: string;
  /** Événement où le post a été publié : un sous-événement quand il vient de l'un d'eux. */
  eventId: string;
  caption: string | null;
  /** Au moins une image, dans l'ordre du carrousel. */
  images: PostImage[];
  publishedAt: string;
};

/** Limites d'un post, les mêmes que l'API (ADR 0029 du backend). */
export const MAX_POST_IMAGES = 10;
export const MAX_CAPTION = 2200;

/** Corps envoyé à l'API pour publier un post. */
export type PostPayload = {
  caption: string | null;
  images: { url: string; alt: string | null }[];
};

/** Résumé joint à l'événement, pour la tuile « Posts ». */
export type EventPostSummary = {
  count: number;
  latestAt: string | null;
};

/** Une page du fil de l'événement, du plus récent au plus ancien. */
export type PostPage = {
  posts: EventPost[];
  nextCursor: string | null;
};

/**
 * Du nouveau depuis la dernière visite du fil sur cet appareil : la tuile
 * s'anime pour se faire remarquer.
 */
export function hasNewPosts(
  summary: EventPostSummary | null | undefined,
  lastSeenAt: string | null,
): boolean {
  if (!summary?.count || !summary.latestAt) return false;
  return !lastSeenAt || new Date(summary.latestAt) > new Date(lastSeenAt);
}
