import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@clared/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

type PanelMode = "none" | "detail";

const CREATE_DEFAULTS = {
  entityId: "",
  name: "",
  country: "",
  address: "",
  vatId: "",
};

const comboboxTriggerClass =
  "min-h-11 w-full bg-card text-foreground font-normal hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const PRIMARY_SUBMIT_CLASS =
  "btn-primary mt-2 min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function toRegistryRow(row: CustomerRow): RegistryListRow {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.entityName || "—",
    pillLabel: row.entityName,
    countryIso: row.country,
    address: row.address,
    taxId: row.vatId,
    linkedAccount: row.entityName,
  };
}

export interface KundenScreenProps {}

export function KundenScreen(_props: KundenScreenProps = {}) {
  const { t } = useTranslation();
  const { me } = useSession();
  const canCreate = me?.permissions.includes("kunde.write") ?? false;
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("none");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(CREATE_DEFAULTS);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const userClosedRef = useRef(false);

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

  useEffect(() => {
    if (loading || customers.length === 0 || userClosedRef.current) return;
    if (selectedId == null || !customers.some((row) => row.id === selectedId)) {
      setSelectedId(customers[0].id);
      setPanelMode("detail");
    }
  }, [loading, customers, selectedId]);

  const registryRows = useMemo(
    () => customers.map(toRegistryRow),
    [customers],
  );
  const selectedRow = registryRows.find((row) => row.id === selectedId);
  const selectedEntity =
    entities.find((row) => row.id === createForm.entityId) ?? null;
  const selectedCountry =
    COUNTRY_OPTIONS.find((row) => row.iso === createForm.country) ?? null;

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);
    if (!createForm.entityId) {
      setFieldError("Bitte Entity wählen.");
      return;
    }
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
      setCreateOpen(false);
      setSelectedId(created.id);
      setPanelMode("detail");
      setCreateForm(CREATE_DEFAULTS);
    } finally {
      setSubmitting(false);
    }
  }

  function openCreate() {
    setCreateOpen(true);
    setFieldError(null);
    setCreateForm(CREATE_DEFAULTS);
  }

  function selectRow(id: string) {
    userClosedRef.current = false;
    setSelectedId(id);
    setPanelMode("detail");
    setFieldError(null);
  }

  function closePanel() {
    userClosedRef.current = true;
    setPanelMode("none");
    setSelectedId(null);
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

  const createPanel = (
    <form className="flex flex-col gap-4" onSubmit={handleCreate}>
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
        disabled={submitting || !createForm.entityId}
        className={PRIMARY_SUBMIT_CLASS}
      >
        {submitting ? <Spinner /> : t("registry.createSubmit")}
      </Button>
    </form>
  );

  return (
    <>
    <RegistryListPanel
      title={t("registry.kundenTitle")}
      count={customers.length}
      searchPlaceholder={t("registry.searchKunden")}
      newButtonLabel={t("registry.newKunde")}
      canCreate={canCreate}
      createHint="Keine Berechtigung zum Anlegen von Kunden."
      onNew={openCreate}
      rows={registryRows}
      rowTestId="kunden-row"
      loading={loading}
      loadError={loadError}
      onRetry={() => void loadData()}
      emptyTitle={t("empty.generic.title")}
      emptyDescription={t("empty.generic.body")}
      selectedId={selectedId}
      onSelectRow={selectRow}
      panelMode={panelMode}
      onClosePanel={closePanel}
      selectedRow={selectedRow}
      nameColumnHeader={t("registry.kundenTitle")}
      pillColumnHeader={t("registry.entity")}
      createPanel={null}
      detailTestId="kunden-detail"
    />
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent className="sm:max-w-[560px]" showCloseButton>
        <DialogHeader>
          <DialogTitle>{t("registry.newKunde")}</DialogTitle>
          <DialogDescription>{t("registry.kundeModalBody")}</DialogDescription>
        </DialogHeader>
        {createPanel}
        <DialogFooter>
          <DialogClose className="inline-flex h-11 items-center rounded-lg border px-5 text-sm">
            {t("registry.cancel")}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
