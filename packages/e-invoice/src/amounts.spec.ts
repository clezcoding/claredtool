import { assertAmountsEqual, roundEur } from "./amounts";
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
