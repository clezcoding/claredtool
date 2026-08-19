import { Card, CardContent } from "@clared/ui";
import { useState } from "react";
import { CreateDisabledButton } from "../components/create-disabled-button";
import { SAMPLE_INVOICE } from "../data/sample-invoice";

const ENTITY_ID = SAMPLE_INVOICE.seller.ustid;

export function EntitiesScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const seller = SAMPLE_INVOICE.seller;

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold">Entities</h1>
        <CreateDisabledButton />
      </header>

      <ul className="flex max-w-xl flex-col gap-2">
        <li>
          <button
            type="button"
            data-testid="entity-row"
            onClick={() => setSelectedId(ENTITY_ID)}
            className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-accent"
          >
            {seller.name}
          </button>
        </li>
      </ul>

      {selectedId === ENTITY_ID ? (
        <Card data-testid="entity-detail" className="max-w-xl">
          <CardContent className="flex flex-col gap-2 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div>{seller.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Adresse</div>
              <div>{seller.address}</div>
            </div>
            <div>
              <div className="text-muted-foreground">USt-IdNr.</div>
              <div>{seller.ustid}</div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
