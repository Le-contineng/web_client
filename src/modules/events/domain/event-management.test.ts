import { describe, expect, it } from "vitest";
import {
  countByTab,
  eventsOfTab,
  managementTab,
  readManagementTab,
} from "@/modules/events/domain/event-management";

const event = (
  id: string,
  startsAt: string,
  period: "upcoming" | "ongoing" | "past",
  status: "published" | "updated" | "cancelled" = "published",
) => ({ id, startsAt, period, status });

const events = [
  event("a", "2026-11-12T10:00:00Z", "upcoming"),
  event("b", "2026-11-10T10:00:00Z", "upcoming", "updated"),
  event("c", "2026-11-07T08:00:00Z", "ongoing"),
  event("d", "2026-10-01T10:00:00Z", "past"),
  event("e", "2026-10-20T10:00:00Z", "past"),
  event("f", "2026-11-20T10:00:00Z", "upcoming", "cancelled"),
];

describe("managementTab", () => {
  it("range un événement annulé dans « Annulés », quelle que soit sa période", () => {
    expect(managementTab(events[5]!)).toBe("cancelled");
    expect(managementTab(events[1]!)).toBe("upcoming");
  });
});

describe("eventsOfTab", () => {
  it("met le plus proche d'abord pour ce qui arrive", () => {
    expect(eventsOfTab(events, "upcoming").map((e) => e.id)).toEqual([
      "b",
      "a",
    ]);
  });
  it("met le plus récent d'abord pour ce qui est passé", () => {
    expect(eventsOfTab(events, "past").map((e) => e.id)).toEqual(["e", "d"]);
  });
});

describe("countByTab", () => {
  it("compte chaque onglet", () => {
    expect(countByTab(events)).toEqual({
      upcoming: 2,
      ongoing: 1,
      past: 2,
      cancelled: 1,
    });
  });
});

describe("readManagementTab", () => {
  it("revient à « À venir » pour une valeur inconnue", () => {
    expect(readManagementTab("past")).toBe("past");
    expect(readManagementTab("nimporte")).toBe("upcoming");
    expect(readManagementTab(undefined)).toBe("upcoming");
  });
});
