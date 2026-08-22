const EMPTY_BODY =
  "Erstellen Sie Ihre erste Rechnung und sehen Sie sofort die Steuerberechnung. Der komplette Ablauf – vom Entwurf bis zum fertigen PDF – dauert unter 2 Minuten.";

export function InvoiceEmptyState() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <img
        src="/empty-state-hero.png"
        alt=""
        className="w-full max-w-xl rounded-md"
      />
      <h1 className="text-xl font-semibold">Noch keine Rechnung erstellt</h1>
      <p className="whitespace-normal break-words text-sm text-muted-foreground">
        {EMPTY_BODY}
      </p>
    </div>
  );
}
