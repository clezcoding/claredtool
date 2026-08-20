import { X } from "lucide-react";
import type { LineItem } from "../data/sample-invoice";

export function LineItemCard({
  item,
  onDelete,
}: {
  item: LineItem;
  onDelete: () => void;
}) {
  return (
    <div
      data-testid="line-item-card"
      className="group relative rounded-md border border-border bg-card p-3"
    >
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-2 top-2 text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Position löschen"
      >
        <X size={14} />
      </button>
      <dl className="grid grid-cols-4 gap-2 pr-6 text-sm">
        <div>
          <dt className="text-muted-foreground">Bezeichnung</dt>
          <dd className="break-words whitespace-normal">{item.bezeichnung}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Menge</dt>
          <dd className="break-words whitespace-normal">{item.menge}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Einzelpreis</dt>
          <dd className="break-words whitespace-normal">{item.einzelpreis.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Netto</dt>
          <dd className="break-words whitespace-normal">{item.netto.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
