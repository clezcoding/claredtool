import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { StagedTaxDecision } from "../data/sample-invoice";
import { formatDateDe, formatMoney } from "../lib/money";
import { MaterialIcon } from "./material-icon";

export interface TaxRailProps {
  tax: Pick<
    StagedTaxDecision,
    "invoice_tax_rate" | "reverse_charge_flag" | "legal_reference" | "applied_rule_id"
  > | null;
  evaluateError?: string | null;
  onRetry?: () => void;
  netto?: number;
  currency?: string;
  dueDate?: string;
}

export function TaxRail({
  tax,
  evaluateError,
  onRetry,
  netto = 0,
  currency = "EUR",
  dueDate,
}: TaxRailProps) {
  const { t } = useTranslation();
  const rate = typeof tax?.invoice_tax_rate === "number" ? tax.invoice_tax_rate : 0;
  const reverse = Boolean(tax?.reverse_charge_flag);
  const taxAmount = reverse ? 0 : netto * rate;
  const total = netto + taxAmount;
  const percent = Math.round(rate * 100);
  const vatLabel = reverse
    ? `${t("taxRail.vat")} (0%)`
    : `${t("taxRail.vat")} (${percent}%)`;

  return (
    <aside
      data-testid="tax-rail"
      className="flex w-[360px] shrink-0 flex-col overflow-auto border-l border-border/70 bg-card dark:bg-background"
    >
      <div className="flex flex-col gap-1 border-b border-border/70 p-6">
        <h2 className="text-lg font-semibold text-foreground">{t("taxRail.summary")}</h2>
        <span className="text-xs text-muted-foreground">{t("taxRail.auto")}</span>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto p-6 pb-[90px]">
        <div className="flex flex-col gap-3 border-b border-border/70 pb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t("taxRail.net")}</span>
            <span className="tabular-nums">{formatMoney(netto, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{vatLabel}</span>
            <span className="tabular-nums">{formatMoney(taxAmount, currency)}</span>
          </div>
          <div className="mt-4 border-t border-border/70 pt-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-semibold text-foreground">{t("taxRail.total")}</span>
              <span className="money-display text-[32px] leading-none text-foreground">
                {formatMoney(total, currency)}
              </span>
            </div>
            {dueDate ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("taxRail.dueOn", { date: formatDateDe(dueDate) })}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{t("taxRail.overview")}</h3>
            <span className="rounded bg-brand-soft px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-foreground">
              {reverse ? t("taxRail.reverseCharge") : t("taxRail.standard")}
            </span>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/40 p-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatMoney(netto, currency)}</span>
              <span className="tabular-nums">{formatMoney(taxAmount, currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-foreground">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                {reverse ? t("taxRail.reverseCharge") : `${percent}% DE`}
              </span>
              <span className="tabular-nums">{formatMoney(taxAmount, currency)}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-full rounded-full bg-primary" />
            </div>
          </div>
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
            <MaterialIcon ligature="info" className="mt-0.5 text-[16px]" />
            <p>
              {t("taxRail.rulePrefix")}{" "}
              <strong className="text-foreground">
                {tax?.legal_reference ?? t("taxRail.standard")}
              </strong>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <div className="flex gap-2">
            <MaterialIcon ligature="verified_user" className="mt-0.5 text-[16px] text-primary" />
            <p className="text-sm text-foreground">{t("taxRail.legalCheck")}</p>
          </div>
        </div>

        {evaluateError ? (
          <p className="text-sm text-destructive">{t("taxRail.evaluateError")}</p>
        ) : null}
        {evaluateError && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="self-start text-sm text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("taxRail.retry")}
          </button>
        ) : null}

        <Link
          to="/pdf"
          className="mt-auto flex flex-col gap-2 text-sm text-primary"
        >
          <div
            className="h-36 w-28 self-center rounded-sm border border-border/20 bg-card shadow-md"
            aria-hidden
          />
          {t("taxRail.pdfPreview")}
        </Link>
      </div>
    </aside>
  );
}
