import { Card, CardContent } from "@clared/ui";
import { useState } from "react";
import { InvoiceEmptyState } from "../components/invoice-empty-state";
import { LineItemCard } from "../components/line-item-card";
import { SAMPLE_INVOICE, type LineItem } from "../data/sample-invoice";

const BLANK_LINE: LineItem = {
  bezeichnung: "",
  menge: 0,
  einzelpreis: 0,
  netto: 0,
};

export function RechnungScreen() {
  const [empty, setEmpty] = useState(false);
  const [rechnungsnummer, setRechnungsnummer] = useState(
    SAMPLE_INVOICE.rechnungsnummer,
  );
  const [datum, setDatum] = useState(SAMPLE_INVOICE.datum);
  const [faellig, setFaellig] = useState(SAMPLE_INVOICE.faellig);
  const [lineItems, setLineItems] = useState<LineItem[]>(SAMPLE_INVOICE.lineItems);

  function restoreSample() {
    setRechnungsnummer(SAMPLE_INVOICE.rechnungsnummer);
    setDatum(SAMPLE_INVOICE.datum);
    setFaellig(SAMPLE_INVOICE.faellig);
    setLineItems(SAMPLE_INVOICE.lineItems);
    setEmpty(false);
  }

  return (
    <div className="flex h-full min-h-0">
      <section className="flex min-h-0 flex-1 flex-col overflow-auto p-6">
        {empty ? (
          <InvoiceEmptyState onRestore={restoreSample} />
        ) : (
          <div className="flex flex-col gap-4">
            <header className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-semibold">
                Rechnung <span>{rechnungsnummer}</span>
              </h1>
              <button
                type="button"
                onClick={() => setEmpty(true)}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Neue Rechnung
              </button>
            </header>

            <Card>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
                <label className="flex flex-col gap-1">
                  Rechnungsnummer
                  <input
                    className="rounded-md border border-input bg-background px-2 py-1"
                    value={rechnungsnummer}
                    onChange={(event) => setRechnungsnummer(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Datum
                  <input
                    className="rounded-md border border-input bg-background px-2 py-1"
                    value={datum}
                    onChange={(event) => setDatum(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Fällig
                  <input
                    className="rounded-md border border-input bg-background px-2 py-1"
                    value={faellig}
                    onChange={(event) => setFaellig(event.target.value)}
                  />
                </label>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              {lineItems.map((item, index) => (
                <LineItemCard
                  key={`${item.bezeichnung}-${index}`}
                  item={item}
                  onDelete={() =>
                    setLineItems((current) => current.filter((_, i) => i !== index))
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => setLineItems((current) => [...current, BLANK_LINE])}
                className="self-start rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                + Position
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
