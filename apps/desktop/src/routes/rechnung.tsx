import {
  Button,
  Card,
  CardContent,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@clared/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../auth/api";
import { useSession } from "../auth/session-provider";
import { ErrorState } from "../components/error-state";
import { InvoiceEmptyState } from "../components/invoice-empty-state";
import { LineItemCard } from "../components/line-item-card";
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
const comboboxTriggerClass =
  "min-h-11 w-full bg-card text-foreground font-normal hover:bg-muted";

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

export function RechnungScreen() {
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
    } catch {
      setAutosaveStatus("error");
    }
  }, [buildPersistBody, canWrite, draftId, entityId]);

  persistDraftRef.current = persistDraft;
  evaluateDraftRef.current = evaluateDraft;

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
  const currencyOptions = Array.from(
    new Set([currency, "EUR", "USD", "AED", selectedEntity?.currencyDefault ?? "EUR"]),
  );

  return (
    <div className="flex h-full min-h-0">
      <section className="flex min-h-0 max-w-xl flex-1 flex-col overflow-auto bg-background p-6">
        <div className="flex flex-col gap-4">
          <header className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <h1 className="text-xl font-semibold">Rechnung</h1>
              <Combobox
                items={drafts}
                itemToStringValue={(item) => invoiceLabel(item, false)}
                value={currentPickerInvoice}
                onValueChange={(item) => {
                  if (item) handlePickerSelect(item);
                }}
              >
                <ComboboxInput
                  placeholder={pickerLabel}
                  aria-label="Rechnung wählen"
                  className={comboboxTriggerClass}
                  title={pickerLabel}
                />
                <ComboboxContent>
                  <ComboboxEmpty>Keine Rechnung passt zur Suche.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.id} value={item}>
                        {invoiceLabel(item, false)}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              {canWrite && autosaveStatus !== "hidden" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {autosaveStatus === "saving" ? (
                    <>
                      <Spinner />
                      <span>Speichert…</span>
                    </>
                  ) : null}
                  {autosaveStatus === "saved" ? <span>Gespeichert</span> : null}
                  {autosaveStatus === "error" ? (
                    <span>
                      Speichern fehlgeschlagen. Eingaben bleiben sichtbar.
                    </span>
                  ) : null}
                </div>
              ) : null}
              {canWrite ? (
                <Button
                  type="button"
                  onClick={startNewDraft}
                  className="min-h-11 font-semibold"
                >
                  Neue Rechnung
                </Button>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    type="button"
                    disabled
                    className="min-h-11 font-semibold"
                  >
                    Neue Rechnung
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Keine Berechtigung zum Anlegen von Rechnungen.
                  </p>
                </div>
              )}
            </div>
          </header>

          {showHero ? <InvoiceEmptyState /> : null}

          <Card className="border-border bg-card">
            <CardContent className="grid gap-4 pt-6 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="rechnungsnummer">Rechnungsnummer</Label>
                <Input
                  id="rechnungsnummer"
                  readOnly
                  placeholder="Wird vergeben…"
                  value={rechnungsnummer}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="datum">Datum</Label>
                <Input
                  id="datum"
                  type="date"
                  value={datum}
                  readOnly={!canWrite}
                  onChange={(event) => {
                    setDatum(event.target.value);
                    if (canWrite) setAutosaveStatus("saving");
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="faellig">Fällig</Label>
                <Input
                  id="faellig"
                  type="date"
                  value={faellig}
                  readOnly={!canWrite}
                  onChange={(event) => {
                    setFaellig(event.target.value);
                    if (canWrite) setAutosaveStatus("saving");
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="entity-picker">Entity</Label>
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
                    className="min-h-11 w-full bg-card font-normal text-foreground hover:bg-muted"
                  >
                    <SelectValue placeholder="Entity wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((row) => (
                      <SelectItem key={row.id} value={row.id}>
                        {row.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="customer-picker">Kunde</Label>
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
                    className="min-h-11 w-full bg-card font-normal text-foreground hover:bg-muted"
                  >
                    <SelectValue placeholder="Kunde wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((row) => (
                      <SelectItem key={row.id} value={row.id}>
                        {row.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="currency">Währung</Label>
                <Select
                  value={currency}
                  onValueChange={(value) => {
                    setCurrency(value);
                    if (canWrite) setAutosaveStatus("saving");
                  }}
                  disabled={!canWrite}
                >
                  <SelectTrigger
                    id="currency"
                    className="min-h-11 w-full bg-card font-normal text-foreground hover:bg-muted"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            {lineItems.map((item, index) => (
              <LineItemCard
                key={`line-${index}`}
                item={item}
                readOnly={!canWrite}
                onChange={(next) => {
                  setLineItems((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index ? next : row,
                    ),
                  );
                  if (canWrite) setAutosaveStatus("saving");
                }}
                onDelete={() => {
                  setLineItems((current) =>
                    current.filter((_, rowIndex) => rowIndex !== index),
                  );
                  if (canWrite) setAutosaveStatus("saving");
                }}
              />
            ))}
            {canWrite ? (
              <button
                type="button"
                onClick={() => {
                  setLineItems((current) => [...current, { ...BLANK_LINE }]);
                  if (canWrite) setAutosaveStatus("saving");
                }}
                className="btn-primary min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                + Position
              </button>
            ) : null}
          </div>

          {showRail ? (
            <Link
              to="/pdf"
              className="text-sm text-primary"
            >
              PDF Vorschau
            </Link>
          ) : null}
        </div>
      </section>
      {showRail ? (
        <TaxRail
          tax={railTax}
          evaluateError={taxEvaluateError}
          onRetry={() => void evaluateDraft()}
        />
      ) : null}
    </div>
  );
}
