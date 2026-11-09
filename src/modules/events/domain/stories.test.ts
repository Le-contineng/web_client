import { describe, expect, it } from "vitest";
import type { EventView } from "@/modules/events/domain/event-view.types";
import {
  addSeen,
  isStory,
  orderBubbles,
  storyBubbles,
  storyEnd,
} from "@/modules/events/domain/stories";

const now = new Date("2026-11-09T12:00:00Z");

const event = (
  id: string,
  page: string,
  createdAt: string,
  startsAt = "2026-11-20T18:00:00Z",
  status: EventView["status"] = "published",
) =>
  ({
    id,
    createdAt,
    startsAt,
    endsAt: null,
    status,
    organizer: { id: page, name: page, slug: page, photoUrl: null },
  }) as EventView;

describe("storyEnd", () => {
  it("dure deux jours après la création", () => {
    expect(
      storyEnd(event("a", "p", "2026-11-09T10:00:00Z")).toISOString(),
    ).toBe("2026-11-11T10:00:00.000Z");
  });
  it("s'arrête à la fin de l'événement si elle arrive avant", () => {
    const e = {
      ...event("a", "p", "2026-11-09T10:00:00Z", "2026-11-09T18:00:00Z"),
      endsAt: "2026-11-09T20:00:00Z",
    };
    expect(storyEnd(e).toISOString()).toBe("2026-11-09T20:00:00.000Z");
  });
});

describe("isStory", () => {
  it("garde un événement créé il y a moins de deux jours", () => {
    expect(isStory(event("a", "p", "2026-11-08T13:00:00Z"), now)).toBe(true);
  });
  it("écarte un événement créé il y a plus de deux jours", () => {
    expect(isStory(event("a", "p", "2026-11-07T11:00:00Z"), now)).toBe(false);
  });
  it("écarte un événement déjà passé", () => {
    expect(
      isStory(
        event("a", "p", "2026-11-09T08:00:00Z", "2026-11-08T10:00:00Z"),
        now,
      ),
    ).toBe(false);
  });
  it("écarte un événement annulé", () => {
    expect(
      isStory(
        event("a", "p", "2026-11-09T08:00:00Z", undefined, "cancelled"),
        now,
      ),
    ).toBe(false);
  });
});

describe("storyBubbles", () => {
  it("regroupe par page, la publication la plus récente d'abord", () => {
    const bubbles = storyBubbles(
      [
        event("b2", "B", "2026-11-09T09:00:00Z"),
        event("a1", "A", "2026-11-09T10:00:00Z"),
        event("b1", "B", "2026-11-08T20:00:00Z"),
        event("old", "C", "2026-11-01T10:00:00Z"),
      ],
      now,
    );
    expect(
      bubbles.map((b) => [b.organizer.id, b.events.map((e) => e.id)]),
    ).toEqual([
      ["A", ["a1"]],
      ["B", ["b1", "b2"]],
    ]);
  });
});

describe("orderBubbles", () => {
  it("passe les bulles vues après les autres", () => {
    const bubbles = storyBubbles(
      [
        event("a", "A", "2026-11-09T10:00:00Z"),
        event("b", "B", "2026-11-09T09:00:00Z"),
      ],
      now,
    );
    expect(
      orderBubbles(bubbles, new Set(["a"])).map((b) => b.organizer.id),
    ).toEqual(["B", "A"]);
  });
});

describe("addSeen", () => {
  it("ajoute sans doublon, le plus récent à la fin", () => {
    expect(addSeen(["a", "b"], ["a"])).toEqual(["b", "a"]);
  });
});
