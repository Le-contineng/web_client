import type { Event, Period } from "@/modules/events/domain/event";
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
  parent?: { id: string; name: string } | null;
  /** Sous-événements d'un événement principal : leur nombre et le prochain rendez-vous. */
  subEvents?: SubEventsSummary | null;
  /** Posts de l'événement, résumés pour la tuile (ADR 0023). */
  posts?: EventPostSummary | null;
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
};

/** Intérêt pour un événement, tel que renvoyé après l'avoir changé. */
export type InterestState = { interested: boolean; interestCount: number };
