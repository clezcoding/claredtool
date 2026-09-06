import { assertAmountsEqual, normalizeUnitCode, roundEur } from "./amounts";
import { EInvoiceError } from "./errors";

describe("amounts", () => {
  it("roundEur matches pdf-templates cents rounding", () => {
    expect(roundEur(19.005)).toBe(19.01);
    expect(roundEur(100 * 0.19)).toBe(19);
  });

  it("assertAmountsEqual throws AMOUNT_MISMATCH without PII", () => {
    try {
      assertAmountsEqual(
        { lineTotal: 100, taxBasis: 100, taxTotal: 19, grandTotal: 119 },
        { lineTotal: 100, taxBasis: 100, taxTotal: 18, grandTotal: 118 },
      );
      fail("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(EInvoiceError);
      expect((err as EInvoiceError).code).toBe("AMOUNT_MISMATCH");
    }
  });
});

describe("unit-c62", () => {
  it("unit-c62: known allowlist codes pass through", () => {
    for (const code of ["C62", "HUR", "DAY", "MON", "KGM", "MTR", "H87"]) {
      expect(normalizeUnitCode(code)).toBe(code);
    }
  });

  it("unit-c62: unknown unit code falls back to C62", () => {
    expect(normalizeUnitCode("XYZ")).toBe("C62");
    expect(normalizeUnitCode("")).toBe("C62");
    expect(normalizeUnitCode("  ")).toBe("C62");
  });
});
