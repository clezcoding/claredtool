import { Button } from "@clared/ui";
import {
  GripVertical,
  Info,
  ListOrdered,
  MoreVertical,
  Percent,
  Plus,
  Tag,
  User,
} from "lucide-react";
import { useSyncExternalStore } from "react";
import type { StagedTaxDecision } from "../data/sample-invoice";
import { DEMO_RULES, type TaxDemoRule } from "../data/tax-demo-rules";
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

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function TaxDecisionFields({
  taxDecision,
  taxError,
}: {
  taxDecision: StagedTaxDecision | null;
  taxError: string | null;
}) {
  return (
    <>
      <dl className="mt-3 flex flex-col gap-3 text-sm">
        {TAX_FIELDS.map((field) => (
          <div key={field}>
            <dt className="text-muted-foreground">{field}</dt>
            <dd
              className={
                field === "invoice_tax_rate"
                  ? "break-words whitespace-normal tabular-nums"
                  : "break-words whitespace-normal"
              }
            >
              {taxDecision ? String(taxDecision[field]) : "—"}
            </dd>
          </div>
        ))}
      </dl>
      {taxError ? (
        <p className="mt-3 text-sm text-destructive">{TAX_ERROR_COPY}</p>
      ) : null}
    </>
  );
}

function LogicChip({
  icon: Icon,
  label,
  accent,
}: {
  icon: typeof User;
  label: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
        accent ? "bg-primary/30 tabular-nums" : "bg-muted"
      }`}
    >
      <Icon size={12} aria-hidden />
      {label}
    </span>
  );
}

function TaxRuleCard({
  rule,
  isActive,
  taxDecision,
  taxError,
}: {
  rule: TaxDemoRule;
  isActive: boolean;
  taxDecision: StagedTaxDecision | null;
  taxError: string | null;
}) {
  return (
    <article
      className={`rounded-lg border bg-card p-5 dark:bg-[#1A1A1A] dark:text-foreground ${
        isActive
          ? "border-primary/50 ring-2 ring-primary/20"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <GripVertical
            size={16}
            className="mt-0.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                {rule.number}
              </span>
              <h2 className="text-sm font-semibold text-foreground">
                {rule.title}
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {rule.category}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active</span>
            <div
              role="presentation"
              aria-hidden
              className={`relative h-5 w-9 rounded-full ${
                rule.active ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow ${
                  rule.active ? "left-4" : "left-0.5"
                }`}
              />
            </div>
          </div>
          <button
            type="button"
            disabled
            aria-label="Rule options"
            className={`rounded-md p-1 text-muted-foreground ${FOCUS_RING}`}
          >
            <MoreVertical size={16} aria-hidden />
          </button>
        </div>
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">IF</span>
        <LogicChip icon={User} label={`Customer = ${rule.ifCustomer}`} />
        <span className="text-muted-foreground">AND</span>
        <LogicChip icon={Tag} label={`Service = ${rule.andService}`} />
        <span className="text-muted-foreground">THEN</span>
        <LogicChip icon={Percent} label={`Tax = ${rule.thenTax}`} accent />
      </p>

      <div className="mt-4 flex items-end justify-between gap-4 text-xs text-muted-foreground">
        <p className="max-w-xl">{rule.description}</p>
        <p className="shrink-0">Updated {rule.updatedAgo}</p>
      </div>

      {isActive && taxDecision ? (
        <details
          open
          data-testid="tax-decision"
          className="mt-4 rounded-md border border-border/70 bg-muted/30 p-4 dark:border-border dark:bg-[#111110]"
        >
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Live Steuerberechnung
          </summary>
          <TaxDecisionFields taxDecision={taxDecision} taxError={taxError} />
        </details>
      ) : null}
    </article>
  );
}

export function TaxScreen() {
  const { taxDecision, taxError } = useSyncExternalStore(
    subscribeTaxLive,
    getTaxLiveState,
    getTaxLiveState,
  );

  const activeRuleId = taxDecision?.applied_rule_id ?? null;

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto bg-background p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Tax Engine / Settings</p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">
            Tax Rules
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define how tax is determined based on your business logic.
          </p>
        </div>
        <Button
          type="button"
          disabled
          className={`btn-primary min-h-11 gap-2 font-semibold ${FOCUS_RING}`}
        >
          <Plus size={16} aria-hidden />
          New Rule
        </Button>
      </header>

      <div className="flex flex-col gap-3">
        {DEMO_RULES.map((rule) => (
          <TaxRuleCard
            key={rule.id}
            rule={rule}
            isActive={activeRuleId === rule.id}
            taxDecision={taxDecision}
            taxError={taxError}
          />
        ))}
      </div>

      {!taxDecision ? (
        <details
          open
          data-testid="tax-decision"
          className="rounded-lg border border-border bg-card p-5 dark:bg-[#1A1A1A] dark:text-foreground"
        >
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Live Steuerberechnung
          </summary>
          <TaxDecisionFields taxDecision={null} taxError={taxError} />
        </details>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info size={14} aria-hidden />
          Rules are evaluated from top to bottom. First match is applied.
        </p>
        <button
          type="button"
          disabled
          className={`flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm text-muted-foreground dark:bg-[#1A1A1A] dark:text-foreground ${FOCUS_RING}`}
        >
          <ListOrdered size={16} aria-hidden />
          Reorder Rules
        </button>
      </footer>
    </div>
  );
}
