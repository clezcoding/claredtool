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
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../auth/api";
import { useSession } from "../auth/session-provider";
import { ErrorState } from "../components/error-state";
import { Skeleton } from "../components/skeleton";
import { Spinner } from "../components/spinner";

type EntityRow = {
  id: string;
  name: string;
  country: string;
  legalForm: string;
  address: string;
  vatId: string | null;
};

type PanelMode = "none" | "detail" | "create";

const CREATE_DEFAULTS = {
  name: "",
  country: "AT",
  legalForm: "GmbH",
  address: "",
  vatId: "ATU12345678",
};

export function EntitiesScreen() {
  const { me } = useSession();
  const canCreate = me?.permissions.includes("entity.create") ?? false;
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("none");
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(CREATE_DEFAULTS);

  const loadEntities = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await apiFetch("/api/entities");
      if (!res.ok) throw new Error("load failed");
      const rows = (await res.json()) as EntityRow[];
      setEntities(rows);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntities();
  }, [loadEntities]);

  const selected = entities.find((row) => row.id === selectedId);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          country: createForm.country,
          legalForm: createForm.legalForm,
          address: createForm.address,
          vatId: createForm.vatId || undefined,
        }),
      });
      if (!res.ok) throw new Error("create failed");
      const created = (await res.json()) as EntityRow;
      await loadEntities();
      setSelectedId(created.id);
      setPanelMode("detail");
      setCreateForm(CREATE_DEFAULTS);
    } finally {
      setSubmitting(false);
    }
  }

  function openCreate() {
    setSelectedId(null);
    setPanelMode("create");
  }

  function selectRow(id: string) {
    setSelectedId(id);
    setPanelMode("detail");
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold">Entities</h1>
        {canCreate ? (
          <Button
            type="button"
            onClick={openCreate}
            className="min-h-11 font-semibold"
          >
            Anlegen
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <Button type="button" disabled className="min-h-11 font-semibold">
              Anlegen
            </Button>
            <p className="text-xs text-muted-foreground">
              Nur Inhaber können Entities anlegen.
            </p>
          </div>
        )}
      </header>

      {loadError ? (
        <ErrorState onRetry={() => void loadEntities()} />
      ) : loading ? (
        <div className="flex max-w-xl flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : entities.length === 0 ? (
        <div className="max-w-xl text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Noch keine Entity angelegt</p>
          <p>Legen Sie Ihre erste Firma an, um Rechnungen zu stellen.</p>
        </div>
      ) : (
        <ul className="flex max-w-xl flex-col gap-2">
          {entities.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                data-testid="entity-row"
                aria-current={selectedId === row.id ? "true" : undefined}
                onClick={() => selectRow(row.id)}
                className={`w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted ${
                  selectedId === row.id ? "bg-muted" : ""
                }`}
              >
                {row.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {panelMode === "create" ? (
        <Card data-testid="entity-detail" className="max-w-xl">
          <CardContent className="flex flex-col gap-2 pt-6">
            <form className="flex flex-col gap-2" onSubmit={handleCreate}>
              <div className="flex flex-col gap-1">
                <Label htmlFor="entity-name">Name</Label>
                <Input
                  id="entity-name"
                  required
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="entity-country">Land</Label>
                <Select
                  value={createForm.country}
                  onValueChange={(value) =>
                    setCreateForm((current) => ({ ...current, country: value }))
                  }
                >
                  <SelectTrigger id="entity-country" className="w-full min-h-11">
                    <SelectValue placeholder="Land wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AT">Österreich</SelectItem>
                    <SelectItem value="DE">Deutschland</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="entity-legal-form">Rechtsform</Label>
                <Select
                  value={createForm.legalForm}
                  onValueChange={(value) =>
                    setCreateForm((current) => ({
                      ...current,
                      legalForm: value,
                    }))
                  }
                >
                  <SelectTrigger id="entity-legal-form" className="w-full min-h-11">
                    <SelectValue placeholder="Rechtsform wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GmbH">GmbH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="entity-address">Adresse</Label>
                <Input
                  id="entity-address"
                  required
                  value={createForm.address}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="entity-vat">USt-IdNr.</Label>
                <Input
                  id="entity-vat"
                  required
                  value={createForm.vatId}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      vatId: event.target.value,
                    }))
                  }
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="mt-2 min-h-11 self-start font-semibold"
              >
                {submitting ? <Spinner /> : "Entity anlegen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : selected ? (
        <Card data-testid="entity-detail" className="max-w-xl">
          <CardContent className="flex flex-col gap-2 pt-6 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div>{selected.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Land</div>
              <div>{selected.country}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Rechtsform</div>
              <div>{selected.legalForm}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Adresse</div>
              <div>{selected.address}</div>
            </div>
            {selected.vatId ? (
              <div>
                <div className="text-muted-foreground">USt-IdNr.</div>
                <div>{selected.vatId}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
