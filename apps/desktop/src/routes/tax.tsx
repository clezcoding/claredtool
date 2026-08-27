import { useCallback, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../components/material-icon";
import type { StagedTaxDecision } from "../data/sample-invoice";
import { DEMO_RULES, type TaxDemoRule } from "../data/tax-demo-rules";
import { getTaxLiveState, subscribeTaxLive } from "../data/tax-live-store";

export interface TaxScreenProps {}

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

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function cloneRules(): TaxDemoRule[] {
  return DEMO_RULES.map((rule) => ({ ...rule }));
}

function TaxDecisionFields({
  taxDecision,
  taxError,
}: {
  taxDecision: StagedTaxDecision | null;
  taxError: string | null;
}) {
  const { t } = useTranslation();
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
        <p className="mt-3 text-sm text-destructive">
          {t("taxRail.evaluateError")}
        </p>
      ) : null}
    </>
  );
}

function ActiveSwitch({
  active,
  label,
  onToggle,
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className={`relative inline-block h-5 w-10 rounded-full ${FOCUS_RING} ${
          active ? "bg-primary-container" : "bg-muted dark:bg-surface-elevated-dark"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow ${
            active ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function LogicChip({
  ligature,
  label,
  accent,
}: {
  ligature: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-sm shadow-sm ${
        accent
          ? "border-primary-container/30 bg-brand-soft font-medium text-primary-container dark:bg-primary-container/30 dark:text-foreground"
          : "border-border bg-card text-muted-foreground dark:bg-surface-elevated-dark"
      }`}
    >
      <MaterialIcon ligature={ligature} className="text-[14px]" />
      {label}
    </span>
  );
}

export function TaxScreen(_props: TaxScreenProps = {}) {
  const { t } = useTranslation();
  const { taxDecision, taxError } = useSyncExternalStore(
    subscribeTaxLive,
    getTaxLiveState,
    getTaxLiveState,
  );
  const [rules, setRules] = useState(cloneRules);
  const [expandedId, setExpandedId] = useState<string | null>(
    DEMO_RULES[0]?.id ?? null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [extraConditions, setExtraConditions] = useState(0);

  const showBald = useCallback(() => {
    setFeedback(t("cmdk.bald"));
  }, [t]);

  const activeRuleId = taxDecision?.applied_rule_id ?? null;

  function toggleActive(id: string) {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, active: !rule.active } : rule,
      ),
    );
  }

  function updateRule(id: string, patch: Partial<TaxDemoRule>) {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    );
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setRules((prev) => {
      const next = [...prev];
      const from = next.findIndex((rule) => rule.id === dragId);
      const to = next.findIndex((rule) => rule.id === targetId);
      if (from < 0 || to < 0) return prev;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((rule, index) => ({ ...rule, number: index + 1 }));
    });
    setDragId(null);
  }

  return (
    <div className="flex h-full flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-5xl px-8 pb-24 pt-8 lg:px-12 xl:px-16">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 font-serif text-[40px] leading-tight text-foreground">
              {t("tax.title")}
            </h1>
            <p className="text-[15px] text-muted-foreground">{t("tax.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={showBald}
            className={`mt-2 inline-flex items-center gap-2 rounded-md bg-primary-container px-4 py-2 text-sm font-medium text-card shadow-sm hover:opacity-90 dark:text-foreground ${FOCUS_RING}`}
          >
            <MaterialIcon ligature="add" className="text-[16px]" />
            {t("tax.newRule")}
          </button>
        </header>

        {feedback ? (
          <p role="status" className="mb-4 text-sm text-muted-foreground">
            {feedback}
          </p>
        ) : null}

        <div className="space-y-4">
          {rules.map((rule) => {
            const expanded = expandedId === rule.id;
            const isLive = activeRuleId === rule.id;
            return (
              <article
                key={rule.id}
                draggable
                onDragStart={() => setDragId(rule.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDrop(rule.id)}
                className={`rounded-xl border p-5 shadow-sm transition-colors dark:bg-card ${
                  expanded
                    ? "border-2 border-primary-container bg-background p-6"
                    : "cursor-pointer border-border bg-card hover:border-muted-foreground/30"
                } ${rule.active ? "" : "opacity-60"}`}
                onClick={() => {
                  if (!expanded) {
                    setExpandedId(rule.id);
                    setExtraConditions(0);
                  }
                }}
              >
                {expanded ? (
                  <>
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-medium text-foreground">
                          {rule.number}
                        </span>
                        <input
                          className="w-[240px] rounded-md border border-border bg-card px-3 py-1.5 text-base font-medium text-foreground outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                          value={rule.title}
                          onChange={(event) =>
                            updateRule(rule.id, { title: event.target.value })
                          }
                          onClick={(event) => event.stopPropagation()}
                        />
                        <span className="rounded border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {rule.category}
                        </span>
                      </div>
                      <ActiveSwitch
                        active={rule.active}
                        label={t("tax.active")}
                        onToggle={() => toggleActive(rule.id)}
                      />
                    </div>

                    <div className="mb-6 rounded-lg border border-border bg-muted/50 p-5 dark:bg-surface-elevated-dark">
                      <div className="mb-4 flex items-center gap-4">
                        <div className="w-16 text-xs font-semibold tracking-wider text-muted-foreground">
                          {t("tax.if")}
                        </div>
                        <div className="flex flex-1 items-center gap-2">
                          <select
                            aria-label={t("tax.customer")}
                            className="w-[180px] rounded-md border border-border bg-card py-2 pl-3 pr-10 text-sm"
                            value={rule.ifCustomer}
                            onChange={(event) =>
                              updateRule(rule.id, {
                                ifCustomer: event.target.value,
                              })
                            }
                            onClick={(event) => event.stopPropagation()}
                          >
                            <option>Inland</option>
                            <option>EU (B2B/B2C)</option>
                            <option>Drittland</option>
                          </select>
                          <select
                            aria-label="="
                            className="w-[70px] rounded-md border border-border bg-card py-2 pl-3 pr-8 text-sm"
                            defaultValue="="
                            onClick={(event) => event.stopPropagation()}
                          >
                            <option>=</option>
                            <option>!=</option>
                          </select>
                          <select
                            aria-label={t("tax.service")}
                            className="w-[180px] rounded-md border border-border bg-card py-2 pl-3 pr-10 text-sm"
                            value={rule.andService}
                            onChange={(event) =>
                              updateRule(rule.id, {
                                andService: event.target.value,
                              })
                            }
                            onClick={(event) => event.stopPropagation()}
                          >
                            <option>Digital</option>
                            <option>Standard</option>
                            <option>Ermäßigt</option>
                            <option>Export</option>
                          </select>
                        </div>
                      </div>
                      {Array.from({ length: extraConditions }, (_, index) => (
                        <div
                          key={index}
                          className="mb-4 flex items-center gap-4 pl-20"
                        >
                          <select
                            className="w-[180px] rounded-md border border-border bg-card py-2 pl-3 pr-10 text-sm"
                            defaultValue="Service"
                          >
                            <option>Kunde</option>
                            <option>Region</option>
                            <option>Service</option>
                          </select>
                        </div>
                      ))}
                      <div className="mb-6 flex items-center gap-4 pl-20">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-container hover:opacity-80"
                          onClick={(event) => {
                            event.stopPropagation();
                            setExtraConditions((count) => count + 1);
                          }}
                        >
                          <MaterialIcon ligature="add" className="text-[16px]" />
                          {t("tax.addCondition")}
                        </button>
                      </div>
                      <div className="my-4 border-t border-border" />
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-xs font-semibold tracking-wider text-muted-foreground">
                          {t("tax.then")}
                        </div>
                        <div className="flex flex-1 items-center gap-2">
                          <select
                            aria-label={t("tax.taxAction")}
                            className="w-[180px] rounded-md border border-primary-container/30 bg-brand-soft py-2 pl-3 pr-10 text-sm font-medium text-primary-container dark:bg-primary-container/30 dark:text-foreground"
                            value={rule.thenTax}
                            onChange={(event) =>
                              updateRule(rule.id, {
                                thenTax: event.target.value,
                              })
                            }
                            onClick={(event) => event.stopPropagation()}
                          >
                            <option>19% (Standard)</option>
                            <option>7% (Ermäßigt)</option>
                            <option>0% (Steuerfrei)</option>
                            <option>19%</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        {t("tax.description")}
                      </label>
                      <input
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                        value={rule.description}
                        onChange={(event) =>
                          updateRule(rule.id, {
                            description: event.target.value,
                          })
                        }
                        onClick={(event) => event.stopPropagation()}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        className={`rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted ${FOCUS_RING}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setExpandedId(null);
                        }}
                      >
                        {t("tax.cancel")}
                      </button>
                      <button
                        type="button"
                        className={`rounded-md bg-primary-container px-4 py-2 text-sm font-medium text-card shadow-sm hover:opacity-90 dark:text-foreground ${FOCUS_RING}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          showBald();
                        }}
                      >
                        {t("tax.save")}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center text-muted-foreground">
                          <MaterialIcon
                            ligature="drag_indicator"
                            className="text-[16px]"
                          />
                        </span>
                        <span className="w-4 text-lg font-medium text-foreground">
                          {rule.number}
                        </span>
                        <span className="text-base font-medium text-foreground">
                          {rule.title}
                        </span>
                        <span className="rounded border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {rule.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <ActiveSwitch
                          active={rule.active}
                          label={rule.active ? t("tax.active") : t("tax.inactive")}
                          onToggle={() => toggleActive(rule.id)}
                        />
                        <button
                          type="button"
                          aria-label={t("tax.options")}
                          className={`p-1 text-muted-foreground hover:text-foreground ${FOCUS_RING}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            showBald();
                          }}
                        >
                          <MaterialIcon ligature="more_vert" className="text-[20px]" />
                        </button>
                      </div>
                    </div>
                    {rule.number === 2 ? (
                      <div className="mt-4 flex items-center rounded-lg border border-border bg-muted/50 p-3 text-sm dark:bg-surface-elevated-dark">
                        <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                          {t("tax.if")}
                        </span>
                        <span className="ml-2">
                          <LogicChip
                            ligature="person"
                            label={`${t("tax.customer")} = ${rule.ifCustomer}`}
                          />
                        </span>
                        <span className="mx-3 text-xs font-semibold tracking-wider text-muted-foreground">
                          {t("tax.and")}
                        </span>
                        <LogicChip
                          ligature="sell"
                          label={`${t("tax.service")} = ${rule.andService}`}
                        />
                        <span className="mx-4 text-xs font-semibold tracking-wider text-muted-foreground">
                          {t("tax.then")}
                        </span>
                        <LogicChip
                          ligature="receipt_long"
                          label={`${t("tax.taxAction")} = ${rule.thenTax}`}
                          accent
                        />
                      </div>
                    ) : null}
                    {rule.number === 2 ? (
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{rule.description}</span>
                        <span>{rule.updatedAgo}</span>
                      </div>
                    ) : null}
                  </>
                )}

                {isLive && taxDecision ? (
                  <details
                    open
                    data-testid={expanded ? undefined : "tax-decision-live"}
                    className="mt-4 rounded-md border border-border bg-muted/30 p-4 dark:bg-background"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <summary className="cursor-pointer text-sm font-semibold text-foreground">
                      {t("tax.live")}
                    </summary>
                    <TaxDecisionFields
                      taxDecision={taxDecision}
                      taxError={taxError}
                    />
                  </details>
                ) : null}
              </article>
            );
          })}
        </div>

        <details
          open
          data-testid="tax-decision"
          className="mt-6 rounded-lg border border-border bg-card p-5 dark:bg-card"
        >
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            {t("tax.live")}
          </summary>
          <TaxDecisionFields taxDecision={taxDecision} taxError={taxError} />
        </details>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MaterialIcon ligature="info" className="text-[14px]" />
            {t("tax.evaluateHint")}
          </p>
          <button
            type="button"
            onClick={showBald}
            className={`inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm text-muted-foreground dark:bg-card ${FOCUS_RING}`}
          >
            <MaterialIcon ligature="reorder" className="text-[16px]" />
            {t("tax.reorder")}
          </button>
        </footer>
      </div>
    </div>
  );
}
