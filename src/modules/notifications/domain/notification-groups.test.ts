import { describe, expect, it } from "vitest";
import {
  availableCategories,
  filterByCategory,
  groupByPeriod,
} from "./notification-groups";
import type { Notification } from "./notification.types";

function notif(
  id: string,
  type: Notification["type"],
  createdAt: string,
): Notification {
  return { id, type, params: {}, link: null, read: false, createdAt };
}

const list = [
  notif("1", "pageCreated", "2026-10-18T10:00:00"),
  notif("2", "accessGranted", "2026-10-01T08:00:00"),
  notif("3", "requestRejected", "2026-09-30T23:00:00"),
];

describe("availableCategories", () => {
  it("propose « Toutes » puis les seules catégories présentes", () => {
    expect(availableCategories(list)).toEqual(["all", "pages", "access"]);
  });

  it("ne propose que « Toutes » sans notification", () => {
    expect(availableCategories([])).toEqual(["all"]);
  });
});

describe("filterByCategory", () => {
  it("garde tout pour « Toutes »", () => {
    expect(filterByCategory(list, "all")).toHaveLength(3);
  });

  it("regroupe les types d'une même famille", () => {
    expect(filterByCategory(list, "pages").map((n) => n.id)).toEqual([
      "1",
      "3",
    ]);
  });
});

describe("groupByPeriod", () => {
  it("sépare le mois en cours des notifications plus anciennes", () => {
    const { thisMonth, earlier } = groupByPeriod(
      list,
      new Date("2026-10-19T12:00:00"),
    );
    expect(thisMonth.map((n) => n.id)).toEqual(["1", "2"]);
    expect(earlier.map((n) => n.id)).toEqual(["3"]);
  });
});
