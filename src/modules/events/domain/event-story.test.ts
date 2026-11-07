import { describe, expect, it } from "vitest";
import {
  firstUnseen,
  monogram,
  pollState,
  rankOptions,
  storyTone,
} from "@/modules/events/domain/event-story";

const option = (id: string, votes: number) => ({
  id,
  label: id,
  imageUrl: null,
  votes,
});

describe("rankOptions", () => {
  it("classe par votes, garde l'ordre de l'API pour les ex æquo", () => {
    const ranked = rankOptions({
      options: [option("a", 10), option("b", 30), option("c", 10)],
    });
    expect(ranked.map((o) => [o.id, o.rank])).toEqual([
      ["b", 1],
      ["a", 2],
      ["c", 3],
    ]);
    expect(ranked.map((o) => o.percent)).toEqual([60, 20, 20]);
    expect(ranked[1]?.share).toBeCloseTo(1 / 3);
  });

  it("supporte un sondage sans vote", () => {
    const ranked = rankOptions({ options: [option("a", 0)] });
    expect(ranked[0]).toMatchObject({ percent: 0, share: 0, rank: 1 });
  });
});

describe("pollState", () => {
  const poll = {
    id: "p",
    question: "?",
    totalVotes: 0,
    options: [],
    opensAt: "2026-11-10T00:00:00Z",
    closesAt: "2026-11-12T00:00:00Z",
  };
  it("à venir, ouvert puis fermé", () => {
    expect(pollState(poll, new Date("2026-11-09T00:00:00Z"))).toBe("upcoming");
    expect(pollState(poll, new Date("2026-11-11T00:00:00Z"))).toBe("open");
    expect(pollState(poll, new Date("2026-11-12T00:00:00Z"))).toBe("closed");
  });
});

describe("firstUnseen", () => {
  it("donne le premier contenu non vu, ou null", () => {
    const stories = [{ id: "a" }, { id: "b" }];
    expect(firstUnseen(stories, new Set(["a"]))).toBe(1);
    expect(firstUnseen(stories, new Set(["a", "b"]))).toBeNull();
  });
});

describe("storyTone", () => {
  it("suit la nature du contenu", () => {
    expect(storyTone("poll")).toBe("brand");
    expect(storyTone("announcement")).toBe("ink");
    expect(storyTone("map")).toBe("deep");
  });
});

describe("monogram", () => {
  it("garde le premier mot de l'option", () => {
    expect(monogram("INP Toulouse")).toBe("INP");
    expect(monogram("SKEMA Business")).toBe("SKEMA");
  });
});
