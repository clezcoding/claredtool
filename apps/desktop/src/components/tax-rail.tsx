import { Info, Shield } from "lucide-react";
import { Link } from "react-router";
import type { StagedTaxDecision } from "../data/sample-invoice";
import { formatDateDe, formatMoney } from "../lib/money";

type RailTax = Pick<
  StagedTaxDecision,
  "invoice_tax_rate" | "reverse_charge_flag" | "legal_reference" | "applied_rule_id"
>;

const TAX_ERROR_COPY =
  "Steuerberechnung fehlgeschlagen. Letzte gültige Werte bleiben sichtbar.";

function Sparkline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 32"
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,24 20,18 40,22 55,12 70,16 90,8 120,4"
      />
      <polyline
        fill="url(#spark-fill)"
        stroke="none"
        points="0,32 0,24 20,18 40,22 55,12 70,16 90,8 120,4 120,32"
      />
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function TaxRail({
  tax,
  evaluateError,
  onRetry,
  netto = 0,
  currency = "EUR",
  dueDate,
}: {
  tax: RailTax | null;
  evaluateError?: string | null;
  onRetry?: () => void;
  netto?: number;
  currency?: string;
  dueDate?: string;
}) {
  const rate = typeof tax?.invoice_tax_rate === "number" ? tax.invoice_tax_rate : 0;
  const reverse = Boolean(tax?.reverse_charge_flag);
  const taxAmount = reverse ? 0 : netto * rate;
  const total = netto + taxAmount;
  const rateLabel = reverse
    ? "Reverse-Charge · 0 % ausgewiesen"
    : `${Math.round(rate * 100)} % USt. auf Netto`;

  return (
    <aside
      data-testid="tax-rail"
      className="flex w-80 shrink-0 flex-col gap-4 overflow-auto border-l border-border/70 bg-background p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Steuerübersicht</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/30 px-2 py-0.5 text-[11px] font-medium text-foreground">
          Live
          <Info size={11} className="text-muted-foreground" />
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Umsatzsteuer-Verteilung
        </p>
        <p className="mt-2 money-display text-2xl text-foreground">
          {formatMoney(taxAmount, currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{rateLabel}</p>
        <div className="mt-3 h-12 text-[var(--cta-send)]">
          <Sparkline className="h-full w-full" />
        </div>
      </div>

      {reverse ? (
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">Steuer-Status</p>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              Reverse-Charge
            </span>
          </div>
          <p className="mt-2 whitespace-normal break-words text-sm text-muted-foreground">
            {tax?.legal_reference ??
              "Steuerschuldnerschaft des Leistungsempfängers."}
          </p>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-4 dark:border-[var(--cta-send)]/40 dark:shadow-[0_0_28px_rgba(168,191,163,0.18)]">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Gesamtbetrag
        </p>
        <p className="mt-2 money-display text-[32px] leading-none text-foreground">
          {formatMoney(total, currency)}
        </p>
        {dueDate ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Fällig am {formatDateDe(dueDate)}
          </p>
        ) : null}
        <div className="mt-3 hidden h-10 text-[var(--cta-send)] dark:block">
          <Sparkline className="h-full w-full" />
        </div>
      </div>

      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <div className="flex gap-2">
          <Shield className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm text-foreground">
            Rechnung erfüllt Pflichtangaben
          </p>
        </div>
      </div>

      {evaluateError ? (
        <p className="text-sm text-destructive">{TAX_ERROR_COPY}</p>
      ) : null}
      {evaluateError && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="self-start text-sm text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        PDF Vorschau
      </Link>
    </aside>
  );
}
