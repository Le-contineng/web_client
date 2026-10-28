export const ORGANIZATION_TYPES = [
  "club",
  "association",
  "studentUnion",
  "schoolService",
  "other",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

/** Organisation qui publie. Créée seulement après validation d'un admin (US-03). */
export type Page = {
  id: string;
  /** Fixé à la création, même si le nom change : les liens partagés restent valables. */
  slug: string;
  name: string;
  description: string;
  type: OrganizationType;
  photoUrl: string | null;
  createdAt: string;
};

/**
 * Page publique avec ses compteurs (ADR 0019). `viewer` n'existe qu'avec une
 * session : il dit si la personne connectée suit la page.
 */
export type PageDetail = {
  page: Page;
  memberCount: number;
  followerCount: number;
  viewer: { following: boolean } | null;
};

/**
 * Page à suivre, proposée quand l'onglet « Abonnements » est vide : les plus
 * actives que la personne ne suit pas encore (ADR 0024 du backend).
 */
export type PageSuggestion = Pick<Page, "id" | "slug" | "name" | "photoUrl"> & {
  /** Événements en cours ou à venir, non annulés. */
  upcomingEventCount: number;
};

/** État après « Suivre » ou « Ne plus suivre », renvoyé par l'API. */
export type FollowState = { following: boolean; followerCount: number };

export type Role = "owner" | "contributor";

/**
 * Page dont le compte connecté est membre, avec son rôle (US-06). On publie
 * toujours au nom d'une de ces pages ; aucun « profil actif » n'est mémorisé.
 */
export type MemberPage = Pick<Page, "id" | "slug" | "name" | "photoUrl"> & {
  role: Role;
};

/** Membre d'une page, avec son profil public (US-06). */
export type Member = {
  accountId: string;
  name: string;
  photoUrl: string | null;
  role: Role;
  addedAt: string;
};

export type PageRequestStatus =
  "pending" | "accepted" | "rejected" | "withdrawn";

export type PageRequest = {
  id: string;
  name: string;
  description: string;
  type: OrganizationType;
  photoUrl: string | null;
  justification: string;
  status: PageRequestStatus;
  rejectionReason: string | null;
  submittedAt: string;
  /** Renseigné dans l'espace Administration. */
  requester: { id: string; name: string; photoUrl: string | null } | null;
};

/** Corps de « Modifier la page », réservé au propriétaire. */
export type PageProfileBody = {
  name: string;
  description: string;
  type: string;
  photoUrl: string | null;
};

/** Corps d'une demande de page envoyé à l'API (US-03). */
export type PageRequestBody = {
  name: string;
  description: string;
  type: string;
  justification: string;
  photoUrl: string | null;
};
