import { describe, expect, it } from "vitest";
import {
  trackedChanges,
  matches,
  type Event,
  DEFAULT_FILTERS,
  periodOf,
  sort,
  validateEventForm,
} from "@/modules/events/domain/event";
import {
  writeUrlFilters,
  readUrlFilters,
} from "@/modules/events/domain/url-filters";

const now = new Date("2026-10-16T12:00:00Z");

function ev(partial: Partial<Event>): Event {
  return {
    id: "x",
    organizerPageId: "p",
    name: "Nom",
    startsAt: "2026-10-20T10:00:00Z",
    endsAt: null,
    location: "Amphi",
    categories: ["culture"],
    description: null,
    photoUrl: null,
    status: "published",
    latestUpdate: null,
    cancellation: null,
    createdAt: "",
    ...partial,
  };
}

describe("période (US-16, D5, D7)", () => {
  it("à venir avant le début", () => {
    expect(periodOf(ev({}), now)).toBe("upcoming");
  });

  it("sans fin, en cours jusqu'à 23h59 UTC le jour du début", () => {
    expect(periodOf(ev({ startsAt: "2026-10-16T08:00:00Z" }), now)).toBe(
      "ongoing",
    );
    expect(periodOf(ev({ startsAt: "2026-10-15T08:00:00Z" }), now)).toBe(
      "past",
    );
  });

  it("en cours entre début et fin sur plusieurs jours", () => {
    expect(
      periodOf(
        ev({
          startsAt: "2026-10-14T08:00:00Z",
          endsAt: "2026-10-17T08:00:00Z",
        }),
        now,
      ),
    ).toBe("ongoing");
  });
});

describe("tri (US-16)", () => {
  it("en cours en tête, à venir croissant, nom en départage, passés décroissants", () => {
    const list = [
      ev({ id: "passe-ancien", startsAt: "2026-10-01T10:00:00Z" }),
      ev({ id: "b", name: "B", startsAt: "2026-10-20T10:00:00Z" }),
      ev({ id: "a", name: "A", startsAt: "2026-10-20T10:00:00Z" }),
      ev({ id: "passe-recent", startsAt: "2026-10-10T10:00:00Z" }),
      ev({ id: "en-cours", startsAt: "2026-10-16T09:00:00Z" }),
    ];
    expect(sort(list, now).map((e) => e.id)).toEqual([
      "en-cours",
      "a",
      "b",
      "passe-recent",
      "passe-ancien",
    ]);
  });

  it("le statut ne change pas la position", () => {
    const list = [
      ev({
        id: "cancelled",
        status: "cancelled",
        startsAt: "2026-10-18T10:00:00Z",
      }),
      ev({ id: "published", startsAt: "2026-10-19T10:00:00Z" }),
    ];
    expect(sort(list, now).map((e) => e.id)).toEqual([
      "cancelled",
      "published",
    ]);
  });
});

describe("filtres (US-17)", () => {
  it("masque les passés par défaut", () => {
    expect(
      matches(ev({ startsAt: "2026-10-01T10:00:00Z" }), DEFAULT_FILTERS, now),
    ).toBe(false);
  });

  it("OU dans un filtre, ET entre filtres", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      categories: ["party" as const, "culture" as const],
    };
    expect(matches(ev({}), { ...filters, pages: ["other"] }, now)).toBe(false);
    expect(matches(ev({}), { ...filters, pages: ["p"] }, now)).toBe(true);
  });

  it("se lisent et s'écrivent dans l'adresse", () => {
    const f = readUrlFilters({ category: "party,unknown" });
    expect(f).toEqual({
      categories: ["party"],
      periods: ["ongoing", "upcoming"],
      pages: [],
    });
    expect(writeUrlFilters(f)).toBe("category=party");
    const url = "period=past&page=bde,club-foot";
    expect(writeUrlFilters(readUrlFilters(new URLSearchParams(url)))).toBe(url);
  });
});

describe("formulaire (US-11, US-15)", () => {
  const base = {
    name: "Soirée",
    startsAt: "2026-10-20T18:00:00Z",
    endsAt: "",
    location: "Hall",
    categories: ["party"],
    description: "",
  };

  it("accepte un formulaire valide", () => {
    expect(validateEventForm(base, now).ok).toBe(true);
  });

  it("refuse un début passé à la création mais le garde en modification", () => {
    const passe = { ...base, startsAt: "2026-10-10T18:00:00Z" };
    const r = validateEventForm(passe, now);
    expect(!r.ok && r.fieldErrors.startsAt).toBe("startsInPast");
    expect(validateEventForm(passe, now, "2026-10-10T18:00:00.000Z").ok).toBe(
      true,
    );
  });

  it("exige une fin après le début et au moins une catégorie", () => {
    const r = validateEventForm(
      { ...base, endsAt: base.startsAt, categories: [] },
      now,
    );
    expect(!r.ok && r.fieldErrors).toEqual({
      endsAt: "endsBeforeStart",
      categories: "categoryRequired",
    });
  });
});

describe("changements suivis (US-15)", () => {
  it("seuls le début, la fin et le lieu comptent", () => {
    const before = ev({});
    expect(
      trackedChanges(before, { ...before, name: "Autre", description: "x" }),
    ).toEqual([]);
    expect(trackedChanges(before, { ...before, location: "Gymnase" })).toEqual([
      { field: "location", before: "Amphi", after: "Gymnase" },
    ]);
  });
});
