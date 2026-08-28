import { describe, expect, it } from "vitest";
import { taxFraction, taxPercent } from "../lib/money";

describe("taxFraction / taxPercent", () => {
  it("treats engine percent integers as percent, not fraction", () => {
    expect(taxFraction(20)).toBe(0.2);
    expect(taxPercent(20)).toBe(20);
  });

  it("keeps already-normalized fractions", () => {
    expect(taxFraction(0.2)).toBe(0.2);
    expect(taxPercent(0.2)).toBe(20);
  });
});
