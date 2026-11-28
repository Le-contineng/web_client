import { describe, expect, it } from "vitest";
import {
  answerError,
  pageCount,
  readPageIndex,
  readStatusFilter,
  suggestionError,
  textLength,
} from "./suggestion.types";

describe("suggestionError", () => {
  it("accepte de 10 à 1000 caractères, espaces de bord retirés", () => {
    expect(suggestionError("Un tournoi")).toBeNull();
    expect(suggestionError("   court   ")).toBe("suggestionLength");
    expect(suggestionError("a".repeat(1000))).toBeNull();
    expect(suggestionError("a".repeat(1001))).toBe("suggestionLength");
  });

  it("compte un émoji pour un caractère, comme l'API", () => {
    expect(textLength("💡".repeat(10))).toBe(10);
    expect(suggestionError("💡".repeat(10))).toBeNull();
  });
});

describe("answerError", () => {
  it("refuse une réponse vide ou de plus de 1000 caractères", () => {
    expect(answerError("  ")).toBe("answerLength");
    expect(answerError("k")).toBeNull();
    expect(answerError("a".repeat(1001))).toBe("answerLength");
  });
});

describe("lecture de l'adresse", () => {
  it("ne garde qu'un statut connu", () => {
    expect(readStatusFilter("new")).toBe("new");
    expect(readStatusFilter("read")).toBe("read");
    expect(readStatusFilter("lue")).toBeNull();
    expect(readStatusFilter(undefined)).toBeNull();
  });

  it("lit un numéro de page positif, 0 par défaut", () => {
    expect(readPageIndex("2")).toBe(2);
    expect(readPageIndex("-1")).toBe(0);
    expect(readPageIndex("abc")).toBe(0);
    expect(readPageIndex(undefined)).toBe(0);
  });

  it("compte au moins une page", () => {
    expect(pageCount({ size: 20, total: 0 })).toBe(1);
    expect(pageCount({ size: 20, total: 41 })).toBe(3);
  });
});
