import { describe, expect, it } from "vitest";
import { carouselRatio } from "@/modules/events/domain/event-image";
import { hasNewPosts } from "@/modules/events/domain/event-post";

const image = (width: number, height: number) => ({
  url: "/x.jpg",
  width,
  height,
  placeholder: null,
  alt: null,
});

describe("hasNewPosts", () => {
  const summary = { count: 2, latestAt: "2026-11-07T10:00:00Z" };
  it("signale un fil jamais ouvert", () => {
    expect(hasNewPosts(summary, null)).toBe(true);
  });
  it("signale un post publié depuis la dernière visite", () => {
    expect(hasNewPosts(summary, "2026-11-07T09:00:00Z")).toBe(true);
    expect(hasNewPosts(summary, "2026-11-07T10:00:00Z")).toBe(false);
  });
  it("ne signale rien sans post", () => {
    expect(hasNewPosts({ count: 0, latestAt: null }, null)).toBe(false);
    expect(hasNewPosts(undefined, null)).toBe(false);
  });
});

describe("carouselRatio", () => {
  it("suit la première image, bornée comme dans le fil", () => {
    expect(carouselRatio([image(1080, 1080), image(1080, 1920)])).toBe(1);
    expect(carouselRatio([image(1080, 1920)])).toBe(4 / 5);
    expect(carouselRatio([])).toBe(1);
  });
});
