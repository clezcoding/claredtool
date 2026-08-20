import { Card, CardContent } from "@clared/ui";
import { useState } from "react";
import { CreateDisabledButton } from "../components/create-disabled-button";
import { SAMPLE_INVOICE } from "../data/sample-invoice";

const KUNDE_ID = SAMPLE_INVOICE.buyer.name;

export function KundenScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const buyer = SAMPLE_INVOICE.buyer;

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold">Kunden</h1>
        <CreateDisabledButton />
      </header>

      <ul className="flex max-w-xl flex-col gap-2">
        <li>
          <button
            type="button"
            data-testid="kunden-row"
            onClick={() => setSelectedId(KUNDE_ID)}
            className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-accent"
          >
            {buyer.name}
          </button>
        </li>
      </ul>

      {selectedId === KUNDE_ID ? (
        <Card data-testid="kunden-detail" className="max-w-xl">
          <CardContent className="flex flex-col gap-2 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div>{buyer.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Adresse</div>
              <div>{buyer.address}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Land</div>
              <div>{buyer.country}</div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
