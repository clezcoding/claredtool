import { Card, CardContent, CardHeader, CardTitle } from "@clared/ui";
import { SAMPLE_INVOICE } from "../data/sample-invoice";

export function RechnungScreen() {
  const invoice = SAMPLE_INVOICE;

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Rechnung {invoice.rechnungsnummer}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{invoice.rechnungsnummer}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>
            {invoice.seller.name} · {invoice.seller.ustid}
          </p>
          <p>
            {invoice.buyer.name} · {invoice.buyer.country}
          </p>
          <p>
            Datum {invoice.datum} · Fällig {invoice.faellig}
          </p>
          <p>Netto {invoice.nettoGesamt.toFixed(2)} €</p>
        </CardContent>
      </Card>
    </div>
  );
}
