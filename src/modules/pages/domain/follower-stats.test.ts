import { describe, expect, it } from "vitest";
import { readFollowerStatsPeriod } from "./follower-stats";

describe("readFollowerStatsPeriod", () => {
  it("lit une période proposée", () => {
    expect(readFollowerStatsPeriod("7")).toBe(7);
    expect(readFollowerStatsPeriod("365")).toBe(365);
  });

  it("retombe sur 30 jours pour toute autre valeur", () => {
    expect(readFollowerStatsPeriod(undefined)).toBe(30);
    expect(readFollowerStatsPeriod("12")).toBe(30);
    expect(readFollowerStatsPeriod("abc")).toBe(30);
    expect(readFollowerStatsPeriod(["7", "90"])).toBe(30);
  });
});
