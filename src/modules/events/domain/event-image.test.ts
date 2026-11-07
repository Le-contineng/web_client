import { describe, expect, it } from "vitest";
import {
  eventImage,
  eventImageLayout,
  FEED_MAX_RATIO,
  FEED_MIN_RATIO,
  feedImageRatio,
  PUBLIC_IMAGE_HOST,
  withInheritedPhoto,
} from "./event-image";

describe("eventImage", () => {
  it("garde la photo de l'événement quand elle existe", () => {
    expect(
      eventImage({ id: "a1", photoUrl: "/api/v1/medias/x", categories: [] }),
    ).toBe("/api/v1/medias/x");
  });

  it("donne une photo publique sinon, stable pour un même événement", () => {
    const event = { id: "a1", photoUrl: null, categories: ["party" as const] };
    const image = eventImage(event);
    expect(image.startsWith(PUBLIC_IMAGE_HOST)).toBe(true);
    expect(eventImage(event)).toBe(image);
  });

  it("demande la photo publique au format portrait 4:5", () => {
    const image = eventImage({ id: "c3", photoUrl: null, categories: [] });
    expect(image).toContain("w=1080&h=1350");
  });

  it("utilise « Autre » sans catégorie", () => {
    expect(
      eventImage({ id: "b2", photoUrl: null, categories: [] }).startsWith(
        PUBLIC_IMAGE_HOST,
      ),
    ).toBe(true);
  });
});

describe("eventImageLayout", () => {
  it("reprend la disposition de la photo de l'événement", () => {
    const photo = { width: 1080, height: 810, placeholder: "abcdefgh" };
    expect(eventImageLayout({ photoUrl: "/api/v1/medias/x", photo })).toBe(
      photo,
    );
  });

  it("est inconnue pour une ancienne photo, 4:5 pour une photo publique", () => {
    expect(eventImageLayout({ photoUrl: "/api/v1/medias/x" })).toBeNull();
    expect(eventImageLayout({ photoUrl: null })).toEqual({
      width: 1080,
      height: 1350,
      placeholder: null,
    });
  });
});

describe("feedImageRatio", () => {
  const layout = (width: number, height: number) => ({
    width,
    height,
    placeholder: null,
  });

  it("garde les proportions d'une photo entre 4:5 et 1,91:1", () => {
    expect(feedImageRatio(layout(1080, 1350))).toBeCloseTo(0.8);
    expect(feedImageRatio(layout(1600, 900))).toBeCloseTo(16 / 9);
  });

  it("recadre une affiche trop haute ou un bandeau trop large", () => {
    expect(feedImageRatio(layout(1000, 4000))).toBe(FEED_MIN_RATIO);
    expect(feedImageRatio(layout(3000, 500))).toBe(FEED_MAX_RATIO);
  });

  it("prend un cadre carré quand les dimensions sont inconnues", () => {
    expect(feedImageRatio(null)).toBe(1);
  });
});

describe("photos d'une famille d'événements", () => {
  it("un sous-événement sans affiche reprend celle de son principal", () => {
    const sub = {
      id: "sub1",
      photoUrl: null,
      photo: null,
      parent: { photoUrl: "/p.jpg", photo: null },
    };
    expect(withInheritedPhoto(sub).photoUrl).toBe("/p.jpg");
    expect(withInheritedPhoto({ ...sub, photoUrl: "/own.jpg" }).photoUrl).toBe(
      "/own.jpg",
    );
  });

  it("sans affiche des deux côtés, il tire la même photo par défaut", () => {
    const base = { photoUrl: null, categories: ["culture" as const] };
    expect(eventImage({ ...base, id: "sub1", parent: { id: "main" } })).toBe(
      eventImage({ ...base, id: "main" }),
    );
  });
});
