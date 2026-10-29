import { describe, expect, it } from "vitest";
import { isMainTab } from "@/spaces/user/components/main-tabs";

describe("isMainTab", () => {
  it("reconnaît les onglets de la barre du bas", () => {
    for (const path of ["/", "/search", "/my-pages", "/profile"])
      expect(isMainTab(path)).toBe(true);
  });

  it("exclut les pages secondaires", () => {
    for (const path of [
      "/more",
      "/settings/devices",
      "/p/bde",
      "/e/gala26xx",
      "/my-pages/bde",
    ])
      expect(isMainTab(path)).toBe(false);
  });
});
