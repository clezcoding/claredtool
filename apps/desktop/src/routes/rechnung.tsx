import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@clared/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../auth/api";
import { useSession } from "../auth/session-provider";
import { ErrorState } from "../components/error-state";
import { InvoiceEmptyState } from "../components/invoice-empty-state";
import { LineItemCard } from "../components/line-item-card";
import { TaxRail } from "../components/tax-rail";
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
  name: string;
  country: string;
  address: string;
  vatId: string | null;
};

type RailTax = Pick<
  StagedTaxDecision,
  "invoice_tax_rate" | "reverse_charge_flag" | "legal_reference" | "applied_rule_id"
>;

const BLANK_LINE: LineItem = {
  bezeichnung: "",
  menge: 0,
  einzelpreis: 0,
  netto: 0,
};

const TRACER_CUSTOMER = {
  name: "Buyer DE GmbH",
  country: "DE",
  address: "Hauptstraße 1, 10115 Berlin",
  vatId: "DE123456789",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function RechnungScreen() {
  const { me } = useSession();
  const canRead = me?.permissions.includes("invoice.read") ?? false;
  const canWrite = me?.permissions.includes("invoice.write") ?? false;
  const canEvaluate = me?.permissions.includes("tax.evaluate") ?? false;

  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [entityId, setEntityId] = useState("");
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [rechnungsnummer, setRechnungsnummer] = useState("");
  const [datum, setDatum] = useState(todayIso);
  const [faellig, setFaellig] = useState(() => addDaysIso(30));
  const [currency, setCurrency] = useState("EUR");
  const [lineItems, setLineItems] = useState<LineItem[]>([BLANK_LINE]);
  const [showHero, setShowHero] = useState(true);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [taxDecision, setTaxDecision] = useState<RailTax | null>(null);
  const [taxError, setTaxError] = useState<string | null>(null);
  const [persisting, setPersisting] = useState(false);
  const persistedRef = useRef(false);

  const selectedEntity = entities.find((row) => row.id === entityId);

  const loadEntities = useCallback(async () => {
    const res = await apiFetch("/api/entities");
    if (!res.ok) return;
    const rows = (await res.json()) as EntityRow[];
    setEntities(rows);
    if (rows.length === 1 && !entityId) {
      setEntityId(rows[0].id);
      setCurrency(rows[0].currencyDefault ?? "EUR");
    }
  }, [entityId]);

  useEffect(() => {
    if (canRead) void loadEntities();
  }, [canRead, loadEntities]);

  const evaluateDraft = useCallback(async () => {
    if (!canEvaluate || !selectedEntity || !customer) return;
    const body = {
      seller: {
        country: selectedEntity.country,
        legalForm: selectedEntity.legalForm,
        vatId: selectedEntity.vatId ?? undefined,
      },
      customer: {
        country: customer.country,
        name: customer.name,
        vatId: customer.vatId ?? undefined,
      },
      currency,
      items: lineItems
        .filter((item) => item.bezeichnung && item.menge > 0)
        .map((item) => ({
          bezeichnung: item.bezeichnung,
          menge: item.menge,
          einzelpreis: item.einzelpreis,
        })),
    };
    if (body.items.length === 0) return;

    const res = await apiFetch("/api/tax/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const decision = (await res.json()) as StagedTaxDecision;
      setTaxDecision({
        invoice_tax_rate: decision.invoice_tax_rate,
        reverse_charge_flag: decision.reverse_charge_flag,
        legal_reference: decision.legal_reference,
        applied_rule_id: decision.applied_rule_id,
      });
      setTaxError(null);
      return;
    }
    if (res.status === 422) {
      setTaxError("no_unique_match");
    }
  }, [canEvaluate, currency, customer, lineItems, selectedEntity]);

  const persistDraft = useCallback(async () => {
    if (!canWrite || !selectedEntity || persisting) return;
    const filledItems = lineItems.filter(
      (item) => item.bezeichnung && item.menge > 0 && item.einzelpreis > 0,
    );
    if (filledItems.length === 0) return;

    setPersisting(true);
    try {
      let activeCustomer = customer;
      if (!activeCustomer) {
        const customerRes = await apiFetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityId: selectedEntity.id,
            ...TRACER_CUSTOMER,
          }),
        });
        if (!customerRes.ok) return;
        activeCustomer = (await customerRes.json()) as CustomerRow;
        setCustomer(activeCustomer);
      }

      const invoiceRes = await apiFetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId: selectedEntity.id,
          customerId: activeCustomer.id,
          currency,
          items: filledItems.map((item) => ({
            bezeichnung: item.bezeichnung,
            menge: item.menge,
            einzelpreis: item.einzelpreis,
          })),
        }),
      });
      if (!invoiceRes.ok) return;
      const invoice = (await invoiceRes.json()) as {
        id: string;
        number: string;
      };
      setDraftId(invoice.id);
      setRechnungsnummer(invoice.number);
      setShowHero(false);
      persistedRef.current = true;

      if (canEvaluate && activeCustomer) {
        const evalBody = {
          seller: {
            country: selectedEntity.country,
            legalForm: selectedEntity.legalForm,
            vatId: selectedEntity.vatId ?? undefined,
          },
          customer: {
            country: activeCustomer.country,
            name: activeCustomer.name,
            vatId: activeCustomer.vatId ?? undefined,
          },
          currency,
          items: filledItems.map((item) => ({
            bezeichnung: item.bezeichnung,
            menge: item.menge,
            einzelpreis: item.einzelpreis,
          })),
        };
        const evalRes = await apiFetch("/api/tax/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(evalBody),
        });
        if (evalRes.ok) {
          const decision = (await evalRes.json()) as StagedTaxDecision;
          setTaxDecision({
            invoice_tax_rate: decision.invoice_tax_rate,
            reverse_charge_flag: decision.reverse_charge_flag,
            legal_reference: decision.legal_reference,
            applied_rule_id: decision.applied_rule_id,
          });
          setTaxError(null);
        } else if (evalRes.status === 422) {
          setTaxError("no_unique_match");
        }
      }
    } finally {
      setPersisting(false);
    }
  }, [
    canEvaluate,
    canWrite,
    currency,
    customer,
    lineItems,
    persisting,
    selectedEntity,
  ]);

  useEffect(() => {
    if (persistedRef.current || !canWrite || !entityId) return;
    const ready = lineItems.some(
      (item) => item.bezeichnung && item.menge > 0 && item.einzelpreis > 0,
    );
    if (ready) void persistDraft();
  }, [canWrite, entityId, lineItems, persistDraft]);

  function resetForm() {
    setRechnungsnummer("");
    setDatum(todayIso());
    setFaellig(addDaysIso(30));
    setLineItems([BLANK_LINE]);
    setDraftId(null);
    setCustomer(null);
    setTaxDecision(null);
    setTaxError(null);
    persistedRef.current = false;
    setShowHero(false);
  }

  if (!canRead) {
    return (
      <div className="p-6">
        <ErrorState onRetry={() => undefined} />
      </div>
    );
  }

  const showRail = !showHero || Boolean(draftId);

  return (
    <div className="flex h-full min-h-0">
      <section className="flex min-h-0 flex-1 flex-col overflow-auto p-6">
        <div className="flex flex-col gap-4">
          <header className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold">
              Rechnung{" "}
              <span>{rechnungsnummer || "Neue Rechnung"}</span>
            </h1>
            <div className="flex items-center gap-2">
              {canWrite ? (
                <Button
                  type="button"
                  onClick={resetForm}
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

          <Card>
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
                  disabled={!canWrite}
                  onChange={(event) => setDatum(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="faellig">Fällig</Label>
                <Input
                  id="faellig"
                  type="date"
                  value={faellig}
                  disabled={!canWrite}
                  onChange={(event) => setFaellig(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="entity-picker">Entity</Label>
                <Select
                  value={entityId}
                  onValueChange={(value) => {
                    setEntityId(value);
                    const entity = entities.find((row) => row.id === value);
                    if (entity) setCurrency(entity.currencyDefault ?? "EUR");
                    setCustomer(null);
                    persistedRef.current = false;
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
                <Label htmlFor="currency">Währung</Label>
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                  disabled={!canWrite}
                >
                  <SelectTrigger
                    id="currency"
                    className="min-h-11 w-full bg-card font-normal text-foreground hover:bg-muted"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
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
                onChange={(next) =>
                  setLineItems((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index ? next : row,
                    ),
                  )
                }
                onDelete={() =>
                  setLineItems((current) =>
                    current.filter((_, rowIndex) => rowIndex !== index),
                  )
                }
              />
            ))}
            {canWrite ? (
              <button
                type="button"
                onClick={() =>
                  setLineItems((current) => [...current, { ...BLANK_LINE }])
                }
                className="self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                + Position
              </button>
            ) : null}
          </div>
        </div>
      </section>
      {showRail ? (
        <TaxRail
          tax={taxDecision}
          evaluateError={taxError}
          onRetry={() => void evaluateDraft()}
        />
      ) : null}
    </div>
  );
}
