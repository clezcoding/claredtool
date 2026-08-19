import { Link } from "react-router";
import { SAMPLE_INVOICE } from "../data/sample-invoice";

export function TaxRail() {
  const tax = SAMPLE_INVOICE.taxDecision;

  return (
    <aside
      data-testid="tax-rail"
      className="flex w-80 shrink-0 flex-col gap-4 overflow-auto border-l border-border p-4"
    >
      <h2 className="text-sm font-semibold">Live Steuerberechnung</h2>
      <dl className="flex flex-col gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">invoice_tax_rate</dt>
          <dd className="break-words whitespace-normal">{String(tax.invoice_tax_rate)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">reverse_charge_flag</dt>
          <dd className="break-words whitespace-normal">{String(tax.reverse_charge_flag)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">legal_reference</dt>
          <dd className="break-words whitespace-normal">{tax.legal_reference}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">applied_rule_id</dt>
          <dd className="break-words whitespace-normal">{tax.applied_rule_id}</dd>
        </div>
      </dl>
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
