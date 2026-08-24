import { Link } from "react-router";
import type { StagedTaxDecision } from "../data/sample-invoice";

const RAIL_KEYS = [
  "invoice_tax_rate",
  "reverse_charge_flag",
  "legal_reference",
  "applied_rule_id",
] as const;

type RailTax = Pick<StagedTaxDecision, (typeof RAIL_KEYS)[number]>;

const EMPTY_VALUE = "—";
const TAX_ERROR_COPY =
  "Steuerberechnung fehlgeschlagen. Letzte gültige Werte bleiben sichtbar.";

export function TaxRail({
  tax,
  evaluateError,
  onRetry,
}: {
  tax: RailTax | null;
  evaluateError?: string | null;
  onRetry?: () => void;
}) {
  function displayValue(key: keyof RailTax): string {
    if (!tax) return EMPTY_VALUE;
    const value = tax[key];
    if (value === undefined || value === null) return EMPTY_VALUE;
    return String(value);
  }

  return (
    <aside
      data-testid="tax-rail"
      className="flex w-80 shrink-0 flex-col gap-4 overflow-auto border-l border-border p-4"
    >
      <h2 className="text-sm font-semibold">Live Steuerberechnung</h2>
      <dl className="flex flex-col gap-3 text-sm">
        {RAIL_KEYS.map((field) => (
          <div key={field}>
            <dt className="text-muted-foreground">{field}</dt>
            <dd className="break-words whitespace-normal">
              {displayValue(field)}
            </dd>
          </div>
        ))}
      </dl>
      {evaluateError ? (
        <p className="text-sm text-destructive">{TAX_ERROR_COPY}</p>
      ) : null}
      {evaluateError && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="self-start text-sm text-primary underline"
        >
          Erneut versuchen
        </button>
      ) : null}
      <Link
        to="/pdf"
        className="mt-auto flex flex-col gap-2 text-sm text-primary"
      >
        <div
          className="h-36 w-28 self-center rounded-sm border border-border/20 shadow-md"
          style={{ background: "#fff" }}
          aria-hidden
        />
        Vorschau
      </Link>
    </aside>
  );
}
