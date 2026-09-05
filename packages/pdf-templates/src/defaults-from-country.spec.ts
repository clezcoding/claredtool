import { defaultsFromCountry } from "./defaults-from-country";

describe("defaultsFromCountry (D-22)", () => {
  it.each([
    ["DE", { locale: "de", vatLine: "omit" }],
    ["AT", { locale: "de", vatLine: "omit" }],
  ] as const)("%s → de + omit", (country, expected) => {
    expect(defaultsFromCountry(country)).toEqual(expected);
  });

  it.each([
    ["FR", { locale: "en", vatLine: "omit" }],
    ["US", { locale: "en", vatLine: "omit" }],
    ["GB", { locale: "en", vatLine: "omit" }],
  ] as const)("%s → en + omit (not EU-wide de)", (country, expected) => {
    expect(defaultsFromCountry(country)).toEqual(expected);
  });

  it("never returns vatLine zero — zero is knob-only", () => {
    for (const country of ["DE", "AT", "FR", "US", "GB", "  de  "]) {
      expect(defaultsFromCountry(country).vatLine).toBe("omit");
    }
  });
});
