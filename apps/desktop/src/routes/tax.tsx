import { useSyncExternalStore } from "react";
import type { StagedTaxDecision } from "../data/sample-invoice";
import { getTaxLiveState, subscribeTaxLive } from "../data/tax-live-store";

const TAX_FIELDS: (keyof StagedTaxDecision)[] = [
  "place_of_supply_country",
  "tax_liability_party",
  "invoice_tax_rate",
  "invoice_tax_shown",
  "reverse_charge_flag",
  "legal_reference",
  "invoice_text_block_id",
  "applied_rule_id",
  "applied_rule_version",
];

const TAX_ERROR_COPY =
  "Steuerberechnung fehlgeschlagen. Letzte gültige Werte bleiben sichtbar.";

export function TaxScreen() {
  const { taxDecision, taxError } = useSyncExternalStore(
    subscribeTaxLive,
    getTaxLiveState,
    getTaxLiveState,
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Tax</h1>
      <section data-testid="tax-decision" className="max-w-xl">
        <h2 className="mb-3 text-sm font-semibold">Live Steuerberechnung</h2>
        <dl className="flex flex-col gap-3 text-sm">
          {TAX_FIELDS.map((field) => (
            <div key={field}>
              <dt className="text-muted-foreground">{field}</dt>
              <dd className="break-words whitespace-normal">
                {taxDecision ? String(taxDecision[field]) : "—"}
              </dd>
            </div>
          ))}
        </dl>
        {taxError ? (
          <p className="mt-3 text-sm text-destructive">{TAX_ERROR_COPY}</p>
        ) : null}
      </section>
    </div>
  );
}
