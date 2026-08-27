import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@clared/ui";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { apiFetch } from "../auth/api";
import { useSession } from "../auth/session-provider";
import { ErrorState } from "../components/error-state";
import { InvoiceEmptyState } from "../components/invoice-empty-state";
import { LineItemCard } from "../components/line-item-card";
import { MaterialIcon } from "../components/material-icon";
import { Skeleton } from "../components/skeleton";
import { Spinner } from "../components/spinner";
import { TaxRail } from "../components/tax-rail";
import {
  resetTaxLiveState,
  setTaxLiveState,
} from "../data/tax-live-store";
import type { LineItem, StagedTaxDecision } from "../data/sample-invoice";

type EntityRow = {
  id: string;
  name: string;
  country: string;
  legalForm: string;
  address: string;
  vatId: string | null;
  currencyDefault: string;
};

type CustomerRow = {
  id: string;
  entityId: string;
  name: string;
  country: string;
  address: string;
  vatId: string | null;
};

type InvoiceItemRow = {
  id?: string;
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  netto: number;
  position: number;
};

type InvoiceRow = {
  id: string;
  entityId: string;
  customerId: string | null;
  number: string;
  currency: string;
  date: string | null;
  dueDate: string | null;
  items: InvoiceItemRow[];
  updatedAt: string;
};

type AutosaveStatus = "hidden" | "idle" | "saving" | "saved" | "error";

const BLANK_LINE: LineItem = {
  bezeichnung: "",
  menge: 0,
  einzelpreis: 0,
  netto: 0,
};

const AUTOSAVE_DELAY_MS = 600;
const SEND_CTA =
  "btn-primary inline-flex min-h-11 items-center gap-2 rounded-none px-4 font-semibold bg-[var(--cta-send)] text-white hover:bg-[var(--cta-send)]/90";
const OUTLINE_BTN =
  "inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted/50";
const NEUE_RECHNUNG_BTN =
  "btn-primary min-h-11 font-semibold bg-foreground text-background hover:bg-foreground/90 dark:hidden";

function entityInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatSavedAgo(timestamp: number, justNow: string, minutesAgo: (mins: number) => string): string {
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return justNow;
  return minutesAgo(mins);
}

function dueDateFromTerms(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return todayIso();
  return value.slice(0, 10);
}

function decimalToNumber(value: unknown): number {
  if (typeof value === "number") return value;
  return Number(value);
}

function mapItemsFromApi(items: InvoiceItemRow[]): LineItem[] {
  if (items.length === 0) return [{ ...BLANK_LINE }];
  return items.map((row) => ({
    bezeichnung: row.bezeichnung,
    menge: decimalToNumber(row.menge),
    einzelpreis: decimalToNumber(row.einzelpreis),
    netto: decimalToNumber(row.netto),
  }));
}

function invoiceLabel(invoice: InvoiceRow | null, isCurrentUnnumbered: boolean): string {
  if (isCurrentUnnumbered || !invoice?.number) return "Neue Rechnung";
  return invoice.number;
}

export interface RechnungScreenProps {}

export function RechnungScreen(_props: RechnungScreenProps = {}) {
  const { t } = useTranslation();
  const { me } = useSession();
  const canRead = me?.permissions.includes("invoice.read") ?? false;
  const canWrite = me?.permissions.includes("invoice.write") ?? false;
  const canEvaluate = me?.permissions.includes("tax.evaluate") ?? false;

  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [drafts, setDrafts] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [entityId, setEntityId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [rechnungsnummer, setRechnungsnummer] = useState("");
  const [datum, setDatum] = useState(todayIso);
  const [faellig, setFaellig] = useState(() => addDaysIso(30));
  const [currency, setCurrency] = useState("EUR");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...BLANK_LINE }]);
  const [betreff, setBetreff] = useState("");
  const [notiz, setNotiz] = useState("");
  const [zahlungsbedingung, setZahlungsbedingung] = useState("30");
  const [lineItemCategories, setLineItemCategories] = useState<
    Record<number, string>
  >({});
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showHero, setShowHero] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isUnnumberedDraft, setIsUnnumberedDraft] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("hidden");
  const [taxEvaluateError, setTaxEvaluateError] = useState<string | null>(null);
  const [railTax, setRailTax] = useState<Pick<
    StagedTaxDecision,
    "invoice_tax_rate" | "reverse_charge_flag" | "legal_reference" | "applied_rule_id"
  > | null>(null);

  const entityDefaultRef = useRef("EUR");
  const skipAutosaveRef = useRef(false);
  const lastGoodTaxRef = useRef<StagedTaxDecision | null>(null);
  const persistDraftRef = useRef<() => Promise<void>>(async () => {});
  const evaluateDraftRef = useRef<() => Promise<void>>(async () => {});
  const focusEntityRef = useRef(false);

  const selectedEntity = entities.find((row) => row.id === entityId);
  const selectedCustomer = customers.find((row) => row.id === customerId);
  const currentPickerInvoice =
    draftId !== null ? drafts.find((row) => row.id === draftId) ?? null : null;
  const pickerLabel = invoiceLabel(currentPickerInvoice, isUnnumberedDraft);

  const loadCustomers = useCallback(async (nextEntityId: string) => {
    if (!nextEntityId) {
      setCustomers([]);
      return;
    }
    const res = await apiFetch(`/api/customers?entityId=${nextEntityId}`);
    if (!res.ok) {
      setCustomers([]);
      return;
    }
    setCustomers((await res.json()) as CustomerRow[]);
  }, []);

  const applyInvoice = useCallback(
    (invoice: InvoiceRow, entityRows: EntityRow[]) => {
      skipAutosaveRef.current = true;
      setDraftId(invoice.id);
      setIsUnnumberedDraft(false);
      setRechnungsnummer(invoice.number);
      setEntityId(invoice.entityId);
      setCustomerId(invoice.customerId ?? "");
      setDatum(toDateInput(invoice.date));
      setFaellig(toDateInput(invoice.dueDate));
      setCurrency(invoice.currency);
      setLineItems(mapItemsFromApi(invoice.items));
      setShowHero(false);
      const entity = entityRows.find((row) => row.id === invoice.entityId);
      entityDefaultRef.current = entity?.currencyDefault ?? "EUR";
      void loadCustomers(invoice.entityId);
      queueMicrotask(() => {
        skipAutosaveRef.current = false;
      });
    },
    [loadCustomers],
  );

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [entitiesRes, invoicesRes] = await Promise.all([
        apiFetch("/api/entities"),
        apiFetch("/api/invoices"),
      ]);
      if (!entitiesRes.ok || !invoicesRes.ok) {
        throw new Error("load failed");
      }
      const entityRows = (await entitiesRes.json()) as EntityRow[];
      const invoiceRows = (await invoicesRes.json()) as InvoiceRow[];
      setEntities(entityRows);
      setDrafts(invoiceRows);

      if (invoiceRows.length === 0) {
        skipAutosaveRef.current = true;
        setShowHero(true);
        setDraftId(null);
        setIsUnnumberedDraft(false);
        setRechnungsnummer("");
        setEntityId(entityRows.length === 1 ? entityRows[0].id : "");
        setCustomerId("");
        setDatum(todayIso());
        setFaellig(addDaysIso(30));
        setCurrency(
          entityRows.length === 1
            ? (entityRows[0].currencyDefault ?? "EUR")
            : "EUR",
        );
        setLineItems([{ ...BLANK_LINE }]);
        if (entityRows.length === 1) {
          entityDefaultRef.current = entityRows[0].currencyDefault ?? "EUR";
          void loadCustomers(entityRows[0].id);
        }
        resetTaxLiveState();
        lastGoodTaxRef.current = null;
        setRailTax(null);
        setTaxEvaluateError(null);
        queueMicrotask(() => {
          skipAutosaveRef.current = false;
        });
      } else {
        applyInvoice(invoiceRows[0], entityRows);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [applyInvoice, loadCustomers]);

  useEffect(() => {
    if (canRead) void loadDrafts();
  }, [canRead, loadDrafts]);

  const buildPersistBody = useCallback(() => {
    const items = lineItems
      .filter(
        (item) =>
          item.bezeichnung.trim() ||
          item.menge > 0 ||
          item.einzelpreis > 0,
      )
      .map((item) => ({
        bezeichnung: item.bezeichnung,
        menge: item.menge,
        einzelpreis: item.einzelpreis,
      }));

    return {
      entityId,
      customerId: customerId || undefined,
      currency,
      date: datum,
      dueDate: faellig,
      supplyType: "service",
      items,
    };
  }, [currency, customerId, datum, entityId, faellig, lineItems]);

  const evaluateDraft = useCallback(async () => {
    if (!canEvaluate || !selectedEntity || !selectedCustomer) return;

    const filledItems = lineItems.filter(
      (item) => item.bezeichnung && item.menge > 0 && item.einzelpreis > 0,
    );
    if (filledItems.length === 0) return;

    const body = {
      seller: {
        country: selectedEntity.country,
        legalForm: selectedEntity.legalForm,
        vatId: selectedEntity.vatId ?? undefined,
      },
      customer: {
        country: selectedCustomer.country,
        name: selectedCustomer.name,
        vatId: selectedCustomer.vatId ?? undefined,
      },
      currency,
      supplyType: "service",
      items: filledItems.map((item) => ({
        bezeichnung: item.bezeichnung,
        menge: item.menge,
        einzelpreis: item.einzelpreis,
      })),
    };

    const res = await apiFetch("/api/tax/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const decision = (await res.json()) as StagedTaxDecision;
      lastGoodTaxRef.current = decision;
      setRailTax({
        invoice_tax_rate: decision.invoice_tax_rate,
        reverse_charge_flag: decision.reverse_charge_flag,
        legal_reference: decision.legal_reference,
        applied_rule_id: decision.applied_rule_id,
      });
      setTaxLiveState(decision, null);
      setTaxEvaluateError(null);
      return;
    }

    setTaxEvaluateError("evaluate_failed");
    setTaxLiveState(lastGoodTaxRef.current, "evaluate_failed");
  }, [
    canEvaluate,
    currency,
    lineItems,
    selectedCustomer,
    selectedEntity,
  ]);

  const persistDraft = useCallback(async () => {
    if (!canWrite || !entityId || skipAutosaveRef.current) return;

    const body = buildPersistBody();
    if (body.items.length === 0 && !draftId) return;

    setAutosaveStatus("saving");
    try {
      const res = draftId
        ? await apiFetch(`/api/invoices/${draftId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await apiFetch("/api/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        setAutosaveStatus("error");
        return;
      }

      const invoice = (await res.json()) as InvoiceRow;
      setDraftId(invoice.id);
      setIsUnnumberedDraft(false);
      setRechnungsnummer(invoice.number);
      setShowHero(false);
      setDrafts((current) => {
        const without = current.filter((row) => row.id !== invoice.id);
        return [invoice, ...without].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      });
      setAutosaveStatus("saved");
      setSavedAt(Date.now());
    } catch {
      setAutosaveStatus("error");
    }
  }, [buildPersistBody, canWrite, draftId, entityId]);

  persistDraftRef.current = persistDraft;
  evaluateDraftRef.current = evaluateDraft;

  useLayoutEffect(() => {
    if (!focusEntityRef.current || showHero || loading) return;
    focusEntityRef.current = false;
    document.getElementById("entity-picker")?.focus();
  }, [loading, showHero]);

  useEffect(() => {
    if (!canWrite || skipAutosaveRef.current) return;

    const timer = window.setTimeout(() => {
      if (showHero && lineItems.some((item) => item.bezeichnung.trim())) {
        setShowHero(false);
      }
      void persistDraftRef.current();
      void evaluateDraftRef.current();
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [canWrite, currency, customerId, datum, entityId, faellig, lineItems, showHero]);

  function handleEntityChange(nextEntityId: string) {
    const entity = entities.find((row) => row.id === nextEntityId);
    setEntityId(nextEntityId);
    setCustomerId("");
    if (entity) {
      if (currency === entityDefaultRef.current) {
        setCurrency(entity.currencyDefault ?? "EUR");
      }
      entityDefaultRef.current = entity.currencyDefault ?? "EUR";
      void loadCustomers(nextEntityId);
    }
  }

  function handleZahlungsbedingung(value: string) {
    setZahlungsbedingung(value);
    const days = Number(value);
    if (datum && Number.isFinite(days)) {
      setFaellig(dueDateFromTerms(datum, days));
    }
    if (canWrite) setAutosaveStatus("saving");
  }

  function startNewDraft() {
    skipAutosaveRef.current = true;
    setDraftId(null);
    setIsUnnumberedDraft(true);
    setRechnungsnummer("");
    setDatum(todayIso());
    setFaellig(addDaysIso(30));
    setLineItems([{ ...BLANK_LINE }]);
    setCustomerId("");
    setShowHero(false);
    setAutosaveStatus("hidden");
    focusEntityRef.current = true;
    resetTaxLiveState();
    lastGoodTaxRef.current = null;
    setRailTax(null);
    setTaxEvaluateError(null);
    if (entities.length === 1) {
      setEntityId(entities[0].id);
      setCurrency(entities[0].currencyDefault ?? "EUR");
      entityDefaultRef.current = entities[0].currencyDefault ?? "EUR";
      void loadCustomers(entities[0].id);
    } else {
      setEntityId("");
      setCurrency("EUR");
    }
    skipAutosaveRef.current = false;
  }

  function handlePickerSelect(invoice: InvoiceRow) {
    applyInvoice(invoice, entities);
    resetTaxLiveState();
    lastGoodTaxRef.current = null;
    setRailTax(null);
    setTaxEvaluateError(null);
  }

  if (!canRead) {
    return (
      <div className="p-6">
        <ErrorState onRetry={() => undefined} />
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="flex h-full min-h-0"
        data-testid="invoice-skeleton"
      >
        <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </section>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <ErrorState onRetry={() => void loadDrafts()} />
      </div>
    );
  }

  const showRail = !showHero;
  const nettoGesamt = lineItems.reduce(
    (sum, item) => sum + item.menge * item.einzelpreis,
    0,
  );
  const rate = railTax?.invoice_tax_rate ?? 0;
  const taxPercent = rate <= 1 ? Math.round(rate * 100) : Math.round(rate);

  if (showHero) {
    return <InvoiceEmptyState onStart={startNewDraft} />;
  }

  return (
    <div className="flex h-full min-h-0">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-background">
        <header className="flex items-center justify-between gap-4 border-b border-border/70 px-8 py-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="flex min-w-0 items-baseline gap-2 truncate text-xl">
              {pickerLabel === "Neue Rechnung" ? (
                <>
                  <span className="font-normal">Neue </span>
                  <span className="font-serif font-normal">Rechnung</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Rechnung </span>
                  <span className="font-serif font-normal">{pickerLabel}</span>
                </>
              )}
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {t("invoice.draft")}
              </span>
            </h1>
            {drafts.length > 1 ? (
              <Select
                value={draftId ?? ""}
                onValueChange={(value) => {
                  const next = drafts.find((row) => row.id === value);
                  if (next) handlePickerSelect(next);
                }}
              >
                <SelectTrigger
                  aria-label={t("invoice.pickInvoice")}
                  className="h-8 w-auto max-w-[10rem] bg-transparent text-xs font-normal"
                  title={pickerLabel}
                >
                  <SelectValue placeholder={pickerLabel} />
                </SelectTrigger>
                <SelectContent>
                  {drafts.map((row) => (
                    <SelectItem key={row.id} value={row.id}>
                      {invoiceLabel(row, false)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {canWrite && autosaveStatus !== "hidden" ? (
              <div className="mr-1 hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                {autosaveStatus === "saving" ? (
                  <>
                    <Spinner />
                    <span>{t("invoice.saving")}</span>
                  </>
                ) : null}
                {autosaveStatus === "saved" && savedAt ? (
                  <span>
                    {t("invoice.saved")}{" "}
                    {formatSavedAgo(
                      savedAt,
                      t("invoice.justNow"),
                      (mins) => t("invoice.minutesAgo", { count: mins }),
                    )}
                  </span>
                ) : null}
                {autosaveStatus === "error" ? (
                  <span>{t("invoice.saveFailed")}</span>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              disabled
              aria-label={t("invoice.moreOptions")}
              className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground"
            >
              <MaterialIcon ligature="more_horiz" className="text-[16px]" />
            </button>
            {canWrite ? (
              <button
                type="button"
                onClick={() => void persistDraft()}
                className={`${OUTLINE_BTN} hidden dark:inline-flex`}
              >
                {t("invoice.save")}
              </button>
            ) : null}
            {showRail ? (
              <Link to="/pdf" className={OUTLINE_BTN}>
                <MaterialIcon ligature="visibility" className="text-[16px]" />
                {t("invoice.preview")}
              </Link>
            ) : null}
            {canWrite ? (
              <Button type="button" onClick={startNewDraft} className={NEUE_RECHNUNG_BTN}>
                {t("invoice.new")}
              </Button>
            ) : null}
            {showRail ? (
              <div className="inline-flex overflow-hidden rounded-md">
                <Link to="/pdf" className={SEND_CTA}>
                  <MaterialIcon ligature="send" className="text-[14px]" />
                  {t("invoice.send")}
                </Link>
                <button
                  type="button"
                  disabled
                  aria-label={t("invoice.sendOptions")}
                  className="inline-flex min-h-11 items-center border-l border-white/20 bg-[var(--cta-send)] px-2 text-white"
                >
                  <MaterialIcon ligature="expand_more" className="text-[14px]" />
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div
          data-testid="invoice-canvas"
          className="mx-auto flex w-full max-w-[1000px] flex-col gap-8 px-8 py-6 pb-28"
        >
          <div className="grid gap-x-12 gap-y-6 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("invoice.from")}
              </p>
              <Label htmlFor="entity-picker" className="sr-only">
                Entity
              </Label>
              <Select
                value={entityId}
                onValueChange={(value) => {
                  handleEntityChange(value);
                  if (canWrite) setAutosaveStatus("saving");
                }}
                disabled={!canWrite}
              >
                <SelectTrigger
                  id="entity-picker"
                  className="h-11 w-full bg-muted/40 font-normal"
                >
                  {selectedEntity ? (
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                        {entityInitial(selectedEntity.name)}
                      </span>
                      <span className="truncate text-left font-medium">
                        {selectedEntity.name}
                      </span>
                      <MaterialIcon ligature="unfold_more" className="ml-auto shrink-0 text-[20px] text-muted-foreground" />
                    </div>
                  ) : (
                    <SelectValue placeholder={t("invoice.entityPlaceholder")} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {entities.map((row) => (
                    <SelectItem key={row.id} value={row.id}>
                      {row.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEntity ? (
                <>
                  <p className="mt-1 whitespace-normal break-words text-xs text-muted-foreground">
                    {selectedEntity.address}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>
                      St.-Nr. {selectedEntity.vatId ?? "—"}
                    </span>
                    <MaterialIcon ligature="info" className="text-[14px]" />
                  </div>
                </>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("invoice.customer")}
              </p>
              <Label htmlFor="customer-picker" className="sr-only">
                {t("invoice.customer")}
              </Label>
              <Select
                value={customerId}
                onValueChange={(value) => {
                  setCustomerId(value);
                  if (canWrite) setAutosaveStatus("saving");
                }}
                disabled={!canWrite || !entityId}
              >
                <SelectTrigger
                  id="customer-picker"
                  className="h-11 w-full bg-card font-normal"
                >
                  {selectedCustomer ? (
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive text-xs font-bold tracking-wide text-background">
                        {entityInitial(selectedCustomer.name)}
                      </span>
                      <span className="truncate text-left font-medium">
                        {selectedCustomer.name}
                      </span>
                      <MaterialIcon ligature="unfold_more" className="ml-auto shrink-0 text-[20px] text-muted-foreground" />
                    </div>
                  ) : (
                    <SelectValue placeholder={t("invoice.customerPlaceholder")} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {customers.map((row) => (
                    <SelectItem key={row.id} value={row.id}>
                      {row.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomer ? (
                <>
                  <p className="mt-1 whitespace-normal break-words text-xs text-muted-foreground">
                    {selectedCustomer.address}
                  </p>
                  {selectedCustomer.vatId ? (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>USt-IdNr. {selectedCustomer.vatId}</span>
                      <MaterialIcon ligature="info" className="text-[14px]" />
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rechnungsnummer" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("invoice.number")}
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="rechnungsnummer"
                  readOnly
                  placeholder={t("invoice.numberPending")}
                  value={rechnungsnummer}
                  className="h-11 bg-card pr-10"
                />
                <button
                  type="button"
                  disabled={!canWrite}
                  aria-label={t("invoice.numberSettings")}
                  className="absolute right-2 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <MaterialIcon ligature="settings" className="text-[16px]" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="datum" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("invoice.date")}
              </Label>
              <div className="relative">
                <Input
                  id="datum"
                  type="date"
                  value={datum}
                  readOnly={!canWrite}
                  onChange={(event) => {
                    setDatum(event.target.value);
                    if (canWrite) setAutosaveStatus("saving");
                  }}
                  className="h-11 bg-card pr-10"
                />
                <MaterialIcon
                  ligature="calendar_today"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="faellig" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("invoice.due")}
              </Label>
              <div className="relative">
                <Input
                  id="faellig"
                  type="date"
                  value={faellig}
                  readOnly={!canWrite}
                  onChange={(event) => {
                    setFaellig(event.target.value);
                    if (canWrite) setAutosaveStatus("saving");
                  }}
                  className="h-11 bg-card pr-10"
                />
                <MaterialIcon
                  ligature="calendar_today"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zahlungsbedingung" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("invoice.terms")}
              </Label>
              <Select
                value={zahlungsbedingung}
                onValueChange={handleZahlungsbedingung}
                disabled={!canWrite}
              >
                <SelectTrigger
                  id="zahlungsbedingung"
                  className="h-11 w-full bg-card font-normal"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">{t("invoice.terms14")}</SelectItem>
                  <SelectItem value="30">{t("invoice.terms30")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-b border-border/70 pb-8">
            <Label htmlFor="betreff" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("invoice.subject")}
            </Label>
            <Input
              id="betreff"
              value={betreff}
              readOnly={!canWrite}
              placeholder={t("invoice.subjectPlaceholder")}
              onChange={(event) => setBetreff(event.target.value)}
              className="border-none bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-foreground">{t("invoice.services")}</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-2 font-medium">Pos.</th>
                <th className="py-2 pr-2 font-medium">Beschreibung</th>
                <th className="py-2 pr-2 font-medium">Kategorie</th>
                <th className="py-2 pr-2 font-medium">Menge</th>
                <th className="py-2 pr-2 font-medium">Einheit</th>
                <th className="py-2 pr-2 font-medium">Preis</th>
                <th className="py-2 pr-2 font-medium">USt.</th>
                <th className="py-2 pr-2 text-right font-medium">Betrag</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <LineItemCard
                  key={`line-${index}`}
                  item={item}
                  index={index}
                  taxPercent={taxPercent}
                  kategorie={
                    (lineItemCategories[index] as
                      | "beratung"
                      | "design"
                      | "entwicklung"
                      | undefined) ?? "beratung"
                  }
                  readOnly={!canWrite}
                  onChange={(next) => {
                    setLineItems((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? next : row,
                      ),
                    );
                    if (canWrite) setAutosaveStatus("saving");
                  }}
                  onKategorieChange={(kategorie) => {
                    setLineItemCategories((current) => ({
                      ...current,
                      [index]: kategorie,
                    }));
                  }}
                  onDelete={() => {
                    setLineItems((current) =>
                      current.filter((_, rowIndex) => rowIndex !== index),
                    );
                    if (canWrite) setAutosaveStatus("saving");
                  }}
                />
              ))}
            </tbody>
          </table>
          {canWrite ? (
            <button
              type="button"
              onClick={() => {
                setLineItems((current) => [...current, { ...BLANK_LINE }]);
                if (canWrite) setAutosaveStatus("saving");
              }}
              className="inline-flex items-center gap-2 self-start text-sm text-primary hover:underline"
            >
              <MaterialIcon ligature="add_circle" className="text-[18px]" />
              {t("invoice.addLine")}
            </button>
          ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notiz" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("invoice.note")}
            </Label>
            <textarea
              id="notiz"
              value={notiz}
              readOnly={!canWrite}
              placeholder={t("invoice.notePlaceholder")}
              onChange={(event) => setNotiz(event.target.value)}
              rows={3}
              className="min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex h-20 items-center justify-between gap-4 border-t border-border/70 bg-background/90 px-8 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border/50 px-4 text-sm disabled:opacity-50"
            >
              <MaterialIcon ligature="save" className="text-[18px]" />
              {t("invoice.saveTemplate")}
            </button>
            <button
              type="button"
              disabled
              aria-label={t("invoice.duplicate")}
              className="inline-flex size-11 items-center justify-center rounded-lg border border-border/50 text-muted-foreground disabled:opacity-50"
            >
              <MaterialIcon ligature="content_copy" className="text-[20px]" />
            </button>
            <button
              type="button"
              disabled
              aria-label={t("invoice.delete")}
              className="inline-flex size-11 items-center justify-center rounded-lg border border-border/50 text-destructive disabled:opacity-50"
            >
              <MaterialIcon ligature="delete" className="text-[20px]" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled
              className="inline-flex h-11 items-center gap-2 px-4 text-sm text-muted-foreground disabled:opacity-50"
            >
              {t("invoice.moreActions")}
              <MaterialIcon ligature="expand_less" className="text-[18px]" />
            </button>
            <div className="inline-flex overflow-hidden rounded-md">
              <Link to="/pdf" className={SEND_CTA}>
                <MaterialIcon ligature="send" className="text-[18px]" />
                {t("invoice.send")}
              </Link>
              <button
                type="button"
                disabled
                aria-label={t("invoice.sendOptions")}
                className="inline-flex min-h-11 items-center border-l border-white/20 bg-[var(--cta-send)] px-2 text-white disabled:opacity-50"
              >
                <MaterialIcon ligature="expand_more" className="text-[14px]" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {showRail ? (
        <TaxRail
          tax={railTax}
          evaluateError={taxEvaluateError}
          onRetry={() => void evaluateDraft()}
          netto={nettoGesamt}
          currency={currency}
          dueDate={faellig}
        />
      ) : null}
    </div>
  );
}
