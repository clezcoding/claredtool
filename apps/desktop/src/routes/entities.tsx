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
  getLegalFormsForCountry,
  type CountryOption,
  type LegalFormOption,
} from "../data/legal-forms";

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
  country: "",
  legalForm: "",
  address: "",
  vatId: "",
};

const comboboxTriggerClass =
  "min-h-11 w-full bg-card text-foreground font-normal hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const LIST_ROW_CLASS =
  "w-full rounded-md border border-border bg-card px-3 py-3 text-left transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const PRIMARY_SUBMIT_CLASS =
  "btn-primary mt-2 min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
  const [fieldError, setFieldError] = useState<string | null>(null);

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
  const selectedCountry =
    COUNTRY_OPTIONS.find((row) => row.iso === createForm.country) ?? null;
  const legalFormOptions = createForm.country
    ? getLegalFormsForCountry(createForm.country)
    : [];
  const selectedLegalForm =
    legalFormOptions.find((row) => row.value === createForm.legalForm) ?? null;

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        name: createForm.name,
        country: createForm.country,
        legalForm: createForm.legalForm,
        address: createForm.address,
      };
      if (isEuCountry(createForm.country)) {
        body.vatId = createForm.vatId;
      }

      const res = await apiFetch("/api/entities", {
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
    setFieldError(null);
    setCreateForm(CREATE_DEFAULTS);
  }

  function selectRow(id: string) {
    setSelectedId(id);
    setPanelMode("detail");
    setFieldError(null);
  }

  function onCountryChange(country: CountryOption | null) {
    if (!country) return;
    setCreateForm((current) => ({
      ...current,
      country: country.iso,
      legalForm: "",
      vatId: "",
    }));
  }

  function onLegalFormChange(form: LegalFormOption | null) {
    if (!form) return;
    setCreateForm((current) => ({ ...current, legalForm: form.value }));
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Entities</h1>
          <p className="text-sm text-muted-foreground">
            {entities.length === 1 ? "1 Entity" : `${entities.length} Entities`}
          </p>
        </div>
        <CreateDisabledButton
          enabled={canCreate}
          hint="Nur Inhaber können Entities anlegen."
          onClick={openCreate}
        />
      </header>

      {loadError ? (
        <ErrorState onRetry={() => void loadEntities()} />
      ) : loading ? (
        <div className="flex max-w-xl flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : entities.length === 0 ? (
        <div className="flex max-w-xl flex-col gap-4 text-sm">
          <img
            src="/empty-entities.png"
            alt=""
            className="w-full max-w-xl rounded-md"
          />
          <p className="font-semibold text-foreground">Noch keine Entity angelegt</p>
          <p className="text-muted-foreground">
            Legen Sie Ihre erste Firma an, um Rechnungen zu stellen.
          </p>
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
                className={`${LIST_ROW_CLASS} ${
                  selectedId === row.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium break-words text-foreground">
                      {row.name}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {getCountryLabel(row.country)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {row.legalForm}
                    </span>
                    {row.vatId ? (
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {row.vatId}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {panelMode === "create" ? (
        <Card data-testid="entity-detail" className="max-w-xl border-border">
          <CardContent className="flex flex-col gap-4 pt-6">
            <form className="flex flex-col gap-4" onSubmit={handleCreate}>
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
                <Combobox
                  items={COUNTRY_OPTIONS}
                  itemToStringValue={(item) => item.labelDe}
                  value={selectedCountry}
                  onValueChange={onCountryChange}
                >
                  <ComboboxInput
                    id="entity-country"
                    placeholder="Land wählen"
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
                <Label htmlFor="entity-legal-form">Rechtsform</Label>
                <Combobox
                  items={legalFormOptions}
                  itemToStringValue={(item) => item.labelDe}
                  value={selectedLegalForm}
                  onValueChange={onLegalFormChange}
                >
                  <ComboboxInput
                    id="entity-legal-form"
                    disabled={!createForm.country}
                    placeholder={
                      createForm.country ? "Rechtsform wählen" : "Zuerst Land wählen"
                    }
                    className={comboboxTriggerClass}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Keine Rechtsform passt zur Suche.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.labelDe}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
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
              {isEuCountry(createForm.country) ? (
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
                  {fieldError ? (
                    <p className="text-xs text-destructive">{fieldError}</p>
                  ) : null}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={submitting}
                className={PRIMARY_SUBMIT_CLASS}
              >
                {submitting ? <Spinner /> : "Entity anlegen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : selected ? (
        <Card data-testid="entity-detail" className="max-w-xl border-border">
          <CardContent className="flex flex-col gap-4 pt-6 text-sm">
            <div className="flex flex-col gap-0.5">
              <div className="text-muted-foreground">Name</div>
              <div className="font-medium break-words text-foreground">
                {selected.name}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-muted-foreground">Land</div>
              <div className="text-foreground">{getCountryLabel(selected.country)}</div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-muted-foreground">Rechtsform</div>
              <span className="w-fit rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                {selected.legalForm}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-muted-foreground">Adresse</div>
              <div className="break-words text-foreground">{selected.address}</div>
            </div>
            {selected.vatId ? (
              <div className="flex flex-col gap-0.5">
                <div className="text-muted-foreground">USt-IdNr.</div>
                <div className="tabular-nums text-foreground">{selected.vatId}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
