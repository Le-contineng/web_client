// @vitest-environment node
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { SHARE_IMAGE_MAX_SIDE, toShareJpeg } from "@/shared/lib/share-image";

function png(width: number, height: number) {
  return sharp({
    create: { width, height, channels: 4, background: "#ff000080" },
  })
    .png()
    .toBuffer();
}

async function sizeOf(jpeg: Buffer) {
  const { width, height, format } = await sharp(jpeg).metadata();
  return { width, height, format };
}

describe("toShareJpeg (US-36)", () => {
  it("garde les proportions d'une image large, bornée à 1200 px", async () => {
    expect(
      await sizeOf(await toShareJpeg(await png(2400, 1000), "#fff")),
    ).toEqual({ width: SHARE_IMAGE_MAX_SIDE, height: 500, format: "jpeg" });
  });

  it("garde les proportions d'une affiche haute, sans cadre ni rognage", async () => {
    expect(
      await sizeOf(await toShareJpeg(await png(1080, 1920), "#fff")),
    ).toEqual({ width: 675, height: SHARE_IMAGE_MAX_SIDE, format: "jpeg" });
  });

  it("n'agrandit jamais une petite image", async () => {
    expect(
      await sizeOf(await toShareJpeg(await png(400, 300), "#fff")),
    ).toEqual({ width: 400, height: 300, format: "jpeg" });
  });
});
