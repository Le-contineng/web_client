import type { Event, EventStatus, Period } from "@/modules/events/domain/event";
import type { EventPostSummary } from "@/modules/events/domain/event-post";

/** Projection d'un événement pour l'affichage : page organisatrice et période jointes. */
export type PageSummary = {
  id: string;
  name: string;
  slug: string;
  photoUrl: string | null;
};
/**
 * Disposition de la photo avant son chargement (ADR 0014 du backend) :
 * dimensions en pixels et aperçu flou (ThumbHash en base64).
 */
export type PhotoLayout = {
  width: number;
  height: number;
  placeholder: string | null;
};
export type EventView = Event & {
  period: Period;
  organizer: PageSummary;
  /** Absent pour les photos envoyées avant l'enregistrement des dimensions. */
  photo?: PhotoLayout | null;
  /** Nombre de comptes intéressés, public (ADR 0022 du backend). */
  interestCount?: number;
  /**
   * Ce qu'a fait la personne connectée ; absent sans compte. `followingOrganizer` :
   * elle suit la page organisatrice (ADR 0024 du backend).
   */
  viewer?: { interested: boolean; followingOrganizer?: boolean } | null;
  /** Événement principal d'un sous-événement (ADR 0030 du backend). */
  parent?: ParentEvent | null;
  /** Sous-événements d'un événement principal : leur nombre et le prochain rendez-vous. */
  subEvents?: SubEventsSummary | null;
  /** Posts de l'événement, résumés pour la tuile (ADR 0023). */
  posts?: EventPostSummary | null;
};

/** Événement principal d'un sous-événement, pour le relier à lui (ADR 0030 du backend). */
export type ParentEvent = {
  id: string;
  name: string;
  /** Affiche du principal, reprise par un sous-événement qui n'a pas la sienne. */
  photoUrl: string | null;
  photo?: PhotoLayout | null;
  /** Place dans le programme (1 pour le plus tôt), sur `total`. */
  position: number;
  total: number;
};

export type SubEventsSummary = {
  count: number;
  /** Prochain sous-événement ni passé ni annulé, s'il y en a un. */
  next: {
    id: string;
    name: string;
    startsAt: string;
    endsAt: string | null;
    location: string;
  } | null;
  /** Tous les sous-événements, du plus tôt au plus tard : la rangée de tuiles de la carte. */
  items?: {
    id: string;
    name: string;
    startsAt: string;
    location: string;
    /** Son affiche ; sans affiche, la carte montre celle du principal. */
    photoUrl: string | null;
    period: Period;
    status: EventStatus;
  }[];
};

/** Intérêt pour un événement, tel que renvoyé après l'avoir changé. */
export type InterestState = { interested: boolean; interestCount: number };
