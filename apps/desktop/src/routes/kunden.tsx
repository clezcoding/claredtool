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
} from "@clared/ui";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../auth/api";
import { useSession } from "../auth/session-provider";
import { CreateDisabledButton } from "../components/create-disabled-button";
import { ErrorState } from "../components/error-state";
import { Skeleton } from "../components/skeleton";
import { Spinner } from "../components/spinner";
import { isEuCountry } from "../data/eu-countries";
import {
  COUNTRY_OPTIONS,
  getCountryLabel,
  type CountryOption,
} from "../data/legal-forms";

type EntityRow = {
  id: string;
  name: string;
};

type CustomerRow = {
  id: string;
  entityId: string;
  name: string;
  country: string;
  address: string;
  vatId: string | null;
  entityName: string;
};

type PanelMode = "none" | "detail" | "create";

const CREATE_DEFAULTS = {
  entityId: "",
  name: "",
  country: "",
  address: "",
  vatId: "",
};

const comboboxTriggerClass =
  "min-h-11 w-full bg-card text-foreground font-normal hover:bg-muted";

export function KundenScreen() {
  const { me } = useSession();
  const canCreate = me?.permissions.includes("kunde.write") ?? false;
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("none");
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(CREATE_DEFAULTS);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const entitiesRes = await apiFetch("/api/entities");
      if (!entitiesRes.ok) throw new Error("entities load failed");
      const entityRows = (await entitiesRes.json()) as EntityRow[];
      setEntities(entityRows);

      const customerLists = await Promise.all(
        entityRows.map(async (entity) => {
          const res = await apiFetch(`/api/customers?entityId=${entity.id}`);
          if (!res.ok) return [] as CustomerRow[];
          const rows = (await res.json()) as Omit<CustomerRow, "entityName">[];
          return rows.map((row) => ({
            ...row,
            entityName: entity.name,
          }));
        }),
      );
      setCustomers(customerLists.flat());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selected = customers.find((row) => row.id === selectedId);
  const selectedEntity =
    entities.find((row) => row.id === createForm.entityId) ?? null;
  const selectedCountry =
    COUNTRY_OPTIONS.find((row) => row.iso === createForm.country) ?? null;

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        entityId: createForm.entityId,
        name: createForm.name,
        country: createForm.country,
        address: createForm.address,
      };
      if (isEuCountry(createForm.country)) {
        body.vatId = createForm.vatId;
      }

      const res = await apiFetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (res.status === 400 && isEuCountry(createForm.country)) {
          setFieldError("USt-IdNr. ist für EU-Länder Pflicht.");
        }
        throw new Error("create failed");
      }
      const created = (await res.json()) as Omit<CustomerRow, "entityName">;
      await loadData();
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
    setFieldError(null);
    setCreateForm(CREATE_DEFAULTS);
  }

  function selectRow(id: string) {
    setSelectedId(id);
    setPanelMode("detail");
    setFieldError(null);
  }

  function onEntityChange(entity: EntityRow | null) {
    if (!entity) return;
    setCreateForm((current) => ({ ...current, entityId: entity.id }));
  }

  function onCountryChange(country: CountryOption | null) {
    if (!country) return;
    setCreateForm((current) => ({
      ...current,
      country: country.iso,
      vatId: "",
    }));
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold">Kunden</h1>
        <CreateDisabledButton
          enabled={canCreate}
          hint="Keine Berechtigung zum Anlegen von Kunden."
          onClick={openCreate}
        />
      </header>

      {loadError ? (
        <ErrorState onRetry={() => void loadData()} />
      ) : loading ? (
        <div className="flex max-w-xl flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : customers.length === 0 ? (
        <div className="max-w-xl text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Noch keine Kunden angelegt</p>
          <p>Legen Sie einen Kunden für die gewählte Entity an.</p>
        </div>
      ) : (
        <ul className="flex max-w-xl flex-col gap-2">
          {customers.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                data-testid="kunden-row"
                aria-current={selectedId === row.id ? "true" : undefined}
                onClick={() => selectRow(row.id)}
                className={`w-full rounded-md border border-border px-3 py-2 text-left text-sm break-words hover:bg-muted ${
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
        <Card data-testid="kunden-detail" className="max-w-xl">
          <CardContent className="flex flex-col gap-2 pt-6">
            <form className="flex flex-col gap-2" onSubmit={handleCreate}>
              <div className="flex flex-col gap-1">
                <Label htmlFor="kunde-entity">Entity</Label>
                <Combobox
                  items={entities}
                  itemToStringValue={(item) => item.name}
                  value={selectedEntity}
                  onValueChange={onEntityChange}
                >
                  <ComboboxInput
                    id="kunde-entity"
                    placeholder="Entity wählen"
                    className={comboboxTriggerClass}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Keine Entity passt zur Suche.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="kunde-name">Name</Label>
                <Input
                  id="kunde-name"
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
                <Label htmlFor="kunde-country">Land</Label>
                <Combobox
                  items={COUNTRY_OPTIONS}
                  itemToStringValue={(item) => item.labelDe}
                  value={selectedCountry}
                  onValueChange={onCountryChange}
                >
                  <ComboboxInput
                    id="kunde-country"
                    disabled={!createForm.entityId}
                    placeholder={
                      createForm.entityId ? "Land wählen" : "Zuerst Entity wählen"
                    }
                    className={comboboxTriggerClass}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Kein Land passt zur Suche.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.iso} value={item}>
                          {item.labelDe}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="kunde-address">Adresse</Label>
                <Input
                  id="kunde-address"
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
              {isEuCountry(createForm.country) ? (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="kunde-vat">USt-IdNr.</Label>
                  <Input
                    id="kunde-vat"
                    required
                    value={createForm.vatId}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        vatId: event.target.value,
                      }))
                    }
                  />
                  {fieldError ? (
                    <p className="text-xs text-destructive">{fieldError}</p>
                  ) : null}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={submitting}
                className="mt-2 min-h-11 self-start font-semibold"
              >
                {submitting ? <Spinner /> : "Kunden anlegen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : selected ? (
        <Card data-testid="kunden-detail" className="max-w-xl">
          <CardContent className="flex flex-col gap-2 pt-6 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div className="break-words">{selected.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Entity</div>
              <div className="break-words">{selected.entityName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Land</div>
              <div>{getCountryLabel(selected.country)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Adresse</div>
              <div className="break-words">{selected.address}</div>
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
