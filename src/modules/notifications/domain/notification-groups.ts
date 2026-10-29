import type {
  Notification,
  NotificationType,
} from "@/modules/notifications/domain/notification.types";

/** Filtres du panneau : « Toutes », puis une catégorie par famille de types. */
export type NotificationCategory = "all" | "pages" | "access" | "requests";

const CATEGORY_OF: Record<
  NotificationType,
  Exclude<NotificationCategory, "all">
> = {
  pageCreated: "pages",
  requestRejected: "pages",
  accessGranted: "access",
  accessRevoked: "access",
  newRequest: "requests",
};

const ORDER: Exclude<NotificationCategory, "all">[] = [
  "pages",
  "access",
  "requests",
];

/** « Toutes » puis les seules catégories présentes, dans un ordre stable. */
export function availableCategories(
  list: readonly Notification[],
): NotificationCategory[] {
  const present = new Set(list.map((n) => CATEGORY_OF[n.type]));
  return ["all", ...ORDER.filter((c) => present.has(c))];
}

export function filterByCategory(
  list: readonly Notification[],
  category: NotificationCategory,
): Notification[] {
  return category === "all"
    ? [...list]
    : list.filter((n) => CATEGORY_OF[n.type] === category);
}

/** Sépare les notifications du mois en cours (heure locale) des plus anciennes. */
export function groupByPeriod(
  list: readonly Notification[],
  now: Date,
): { thisMonth: Notification[]; earlier: Notification[] } {
  const thisMonth: Notification[] = [];
  const earlier: Notification[] = [];
  for (const n of list) {
    const d = new Date(n.createdAt);
    const sameMonth =
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    (sameMonth ? thisMonth : earlier).push(n);
  }
  return { thisMonth, earlier };
}
