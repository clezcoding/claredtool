import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Input,
  Label,
} from "@clared/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../auth/api";
import { useSession } from "../auth/session-provider";
import {
  RegistryListPanel,
  type RegistryListRow,
} from "../components/registry-list-panel";
import { Spinner } from "../components/spinner";
import { isEuCountry } from "../data/eu-countries";
import {
  COUNTRY_OPTIONS,
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

const PRIMARY_SUBMIT_CLASS =
  "btn-primary mt-2 min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function toRegistryRow(row: EntityRow): RegistryListRow {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.legalForm || "—",
    pillLabel: row.legalForm,
    countryIso: row.country,
    address: row.address,
    taxId: row.vatId,
  };
}

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

  useEffect(() => {
    if (loading || entities.length === 0 || panelMode === "create") return;
    if (selectedId == null || !entities.some((row) => row.id === selectedId)) {
      setSelectedId(entities[0].id);
      setPanelMode("detail");
    }
  }, [loading, entities, selectedId, panelMode]);

  const registryRows = useMemo(
    () => entities.map(toRegistryRow),
    [entities],
  );
  const selectedRow = registryRows.find((row) => row.id === selectedId);
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

  function closePanel() {
    if (panelMode === "create" && entities[0]) {
      setSelectedId(entities[0].id);
      setPanelMode("detail");
      return;
    }
    setPanelMode("none");
    setSelectedId(null);
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

  const createPanel = (
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
  );

  return (
    <RegistryListPanel
      title="Entities"
      count={entities.length}
      countSingular="Entity"
      countPlural="Entities"
      searchPlaceholder="Search entities..."
      newButtonLabel="+ New Entity"
      canCreate={canCreate}
      createHint="Nur Inhaber können Entities anlegen."
      onNew={openCreate}
      rows={registryRows}
      rowTestId="entity-row"
      loading={loading}
      loadError={loadError}
      onRetry={() => void loadEntities()}
      emptyTitle="Noch keine Entity angelegt"
      emptyDescription="Legen Sie Ihre erste Firma an, um Rechnungen zu stellen."
      selectedId={selectedId}
      onSelectRow={selectRow}
      panelMode={panelMode}
      onClosePanel={closePanel}
      selectedRow={selectedRow}
      pillColumnHeader="Rechtsform"
      createPanel={createPanel}
      detailTestId="entity-detail"
    />
  );
}
