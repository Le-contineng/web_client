import type { Category, Event } from "@/modules/events/domain/event";
import type { PhotoLayout } from "@/modules/events/domain/event-view.types";

/** Hôte des photos publiques utilisées quand un événement n'a pas d'image. */
export const PUBLIC_IMAGE_HOST = "https://images.unsplash.com";

/**
 * Format idéal d'une affiche d'événement : portrait 4:5 (1080 × 1350), comme
 * une publication. Les photos ci-dessous sont nativement verticales (3:4 à
 * 2:3) : le passage au 4:5 ne retire qu'un peu du haut et du bas.
 */
export const IDEAL_WIDTH = 1080;
export const IDEAL_HEIGHT = 1350;

const photo = (id: string) =>
  `${PUBLIC_IMAGE_HOST}/photo-${id}?w=${IDEAL_WIDTH}&h=${IDEAL_HEIGHT}&q=80&auto=format&fit=crop`;

// Photos publiques Unsplash, toutes prises en format vertical.
const BALL_ON_GRASS = "1579952363873-27f3bade9f55"; // ballon sous le pied
const KICK = "1560272564-c83b66b1ad12"; // frappe sur un terrain
const CONFETTI_CROWD = "1509824227185-9c5a01ceba0d"; // foule et confettis
const DANCE_FLOOR = "1574391884720-bbc3740c59d1"; // salle, lumières
const WORKSHOP = "1544928147-79a2dbc1f389"; // atelier autour d'une table
const STUDENTS = "1517486808906-6ca8b3f04846"; // groupe d'étudiants

/** Photos par catégorie, choisies pour leur sujet. */
const PHOTOS: Record<Category, string[]> = {
  match: [KICK, BALL_ON_GRASS],
  interClub: [BALL_ON_GRASS, KICK],
  orientation: [STUDENTS],
  party: [CONFETTI_CROWD, DANCE_FLOOR],
  culture: [CONFETTI_CROWD, DANCE_FLOOR],
  conference: [WORKSHOP],
  campusLife: [STUDENTS, WORKSHOP],
  other: [DANCE_FLOOR, STUDENTS],
};

function hash(text: string): number {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Image affichée pour un événement : sa photo, sinon une photo publique de
 * sa première catégorie, toujours la même pour un même événement.
 */
export function eventImage(
  event: Pick<Event, "id" | "photoUrl" | "categories"> & {
    parent?: { id: string } | null;
  },
): string {
  if (event.photoUrl) return event.photoUrl;
  const choices = PHOTOS[event.categories[0] ?? "other"];
  // Un sous-événement tire la même photo que son principal (ADR 0030 du backend)
  const seed = event.parent?.id ?? event.id;
  return photo(choices[hash(seed) % choices.length]!);
}

/**
 * Disposition de l'image affichée pour un événement : celle de sa photo si
 * l'API la connaît, celle des photos publiques (4:5) sinon. `null` pour une
 * ancienne photo dont les dimensions sont inconnues.
 */
export function eventImageLayout(
  event: Pick<Event, "photoUrl"> & { photo?: PhotoLayout | null },
): PhotoLayout | null {
  if (event.photoUrl) return event.photo ?? null;
  return { width: IDEAL_WIDTH, height: IDEAL_HEIGHT, placeholder: null };
}

/** Le plus vertical admis dans le fil : 4:5, comme une publication. */
export const FEED_MIN_RATIO = 4 / 5;
/** Le plus horizontal admis dans le fil : 1,91:1, au-delà l'image devient un bandeau. */
export const FEED_MAX_RATIO = 1.91;

/**
 * Proportions (largeur / hauteur) du cadre d'une image dans le fil : celles de
 * la photo, ramenées entre 4:5 et 1,91:1. Une affiche plus haute est recadrée
 * au centre au lieu de s'étaler sur plusieurs écrans ; une photo aux
 * dimensions inconnues prend un cadre carré.
 */
export function feedImageRatio(layout: PhotoLayout | null): number {
  if (!layout || layout.width <= 0 || layout.height <= 0) return 1;
  const ratio = layout.width / layout.height;
  return Math.min(FEED_MAX_RATIO, Math.max(FEED_MIN_RATIO, ratio));
}

/**
 * Cadre du carrousel d'un post (ADR 0023) : les proportions de la première
 * image, bornées comme dans le fil ; les suivantes y sont recadrées.
 */
export function carouselRatio(
  images: { width: number; height: number }[],
): number {
  const first = images[0];
  return feedImageRatio(first ? { ...first, placeholder: null } : null);
}

/**
 * Pour l'affichage seulement : un sous-événement sans affiche reprend celle de
 * son événement principal (ADR 0030 du backend), pour qu'on reconnaisse la
 * famille d'un coup d'œil. Jamais pour un formulaire : l'affiche du principal
 * n'appartient pas au sous-événement.
 */
export function withInheritedPhoto<
  T extends Pick<Event, "photoUrl"> & {
    photo?: PhotoLayout | null;
    parent?: { photoUrl: string | null; photo?: PhotoLayout | null } | null;
  },
>(event: T): T {
  if (event.photoUrl || !event.parent?.photoUrl) return event;
  return {
    ...event,
    photoUrl: event.parent.photoUrl,
    photo: event.parent.photo ?? null,
  };
}
