/** Types connus du front ; chacun est la clé de son message dans le catalogue `notifications.*`. */
export const NOTIFICATION_TYPES = [
  "pageCreated",
  "requestRejected",
  "accessGranted",
  "accessRevoked",
  "newRequest",
  "newEvent",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Notification dans l'application, produite par l'API (US-03, US-06, ADR 0019). */
export type Notification = {
  id: string;
  type: NotificationType;
  /**
   * Variables du message : `name`, et `reason` pour un refus ; `page` et
   * `event` pour un nouvel événement d'une page suivie (ADR 0019).
   */
  params: Record<string, string>;
  /** Lien ouvert au clic. */
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function isKnownType(type: string): type is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(type);
}
