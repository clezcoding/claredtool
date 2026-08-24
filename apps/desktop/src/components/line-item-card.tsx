import { Input } from "@clared/ui";
import { X } from "lucide-react";
import type { LineItem } from "../data/sample-invoice";

export function LineItemCard({
  item,
  onChange,
  onDelete,
  readOnly = false,
}: {
  item: LineItem;
  onChange?: (next: LineItem) => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const netto = item.menge * item.einzelpreis;

  return (
    <div
      data-testid="line-item-card"
      className="group relative rounded-md border border-border bg-card p-4"
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
          <dd>
            {readOnly ? (
              <span className="break-words whitespace-normal">
                {item.bezeichnung}
              </span>
            ) : (
              <Input
                value={item.bezeichnung}
                onChange={(event) =>
                  onChange?.({
                    ...item,
                    bezeichnung: event.target.value,
                    netto: item.menge * item.einzelpreis,
                  })
                }
                className="mt-1"
              />
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Menge</dt>
          <dd>
            {readOnly ? (
              <span>{item.menge}</span>
            ) : (
              <Input
                type="number"
                min={0}
                value={item.menge || ""}
                onChange={(event) => {
                  const menge = Number(event.target.value) || 0;
                  onChange?.({
                    ...item,
                    menge,
                    netto: menge * item.einzelpreis,
                  });
                }}
                className="mt-1"
              />
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Einzelpreis</dt>
          <dd>
            {readOnly ? (
              <span>{item.einzelpreis.toFixed(2)}</span>
            ) : (
              <Input
                type="number"
                min={0}
                step="0.01"
                value={item.einzelpreis || ""}
                onChange={(event) => {
                  const einzelpreis = Number(event.target.value) || 0;
                  onChange?.({
                    ...item,
                    einzelpreis,
                    netto: item.menge * einzelpreis,
                  });
                }}
                className="mt-1"
              />
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Netto</dt>
          <dd className="break-words whitespace-normal pt-2">
            {netto.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
