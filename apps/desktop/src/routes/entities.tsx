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
  getLegalFormsForCountry,
  type CountryOption,
  type LegalFormOption,
} from "../data/legal-forms";

type EntityRow = {
  id: string;
  name: string;
  country: string;
  legalForm: string;
  street: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  vatId: string | null;
  email?: string | null;
  phone?: string | null;
  iban?: string | null;
  bic?: string | null;
  hrb?: string | null;
  managingDirector?: string | null;
};

type PanelMode = "none" | "detail";

const CREATE_DEFAULTS = {
  name: "",
  country: "",
  legalForm: "",
  street: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  vatId: "",
  email: "",
  phone: "",
  iban: "",
  bic: "",
  hrb: "",
  managingDirector: "",
};

const comboboxTriggerClass =
  "min-h-11 w-full bg-card text-foreground font-normal hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const PRIMARY_SUBMIT_CLASS =
  "btn-primary mt-2 min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function formatStackedAddress(row: {
  street: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  country: string;
}): string {
  const lines = [row.street];
  if (row.addressLine2?.trim()) lines.push(row.addressLine2.trim());
  lines.push(`${row.postalCode} ${row.city}`.trim());
  lines.push(row.country);
  return lines.filter(Boolean).join("\n");
}

function toRegistryRow(row: EntityRow): RegistryListRow {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.legalForm || "—",
    pillLabel: row.legalForm,
    countryIso: row.country,
    address: formatStackedAddress(row),
    taxId: row.vatId,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    iban: row.iban ?? undefined,
    bic: row.bic ?? undefined,
    registrationNumber: row.hrb ?? undefined,
    people: row.managingDirector?.trim()
      ? [{ name: row.managingDirector.trim(), title: "Geschäftsführer", email: "" }]
      : undefined,
  };
}

function optionalBody(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export interface EntitiesScreenProps {}

export function EntitiesScreen(_props: EntitiesScreenProps = {}) {
  const { t } = useTranslation();
  const { me } = useSession();
  const canCreate = me?.permissions.includes("entity.create") ?? false;
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("none");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(CREATE_DEFAULTS);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const userClosedRef = useRef(false);

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
    if (loading || entities.length === 0 || userClosedRef.current) return;
    if (selectedId == null || !entities.some((row) => row.id === selectedId)) {
      setSelectedId(entities[0].id);
      setPanelMode("detail");
    }
  }, [loading, entities, selectedId]);

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

    if (
      !createForm.street.trim() ||
      !createForm.postalCode.trim() ||
      !createForm.city.trim()
    ) {
      setFieldError(t("registry.errors.incompleteAddress"));
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        name: createForm.name,
        country: createForm.country,
        legalForm: createForm.legalForm,
        street: createForm.street.trim(),
        postalCode: createForm.postalCode.trim(),
        city: createForm.city.trim(),
      };
      const addressLine2 = optionalBody(createForm.addressLine2);
      if (addressLine2) body.addressLine2 = addressLine2;
      if (isEuCountry(createForm.country)) {
        body.vatId = createForm.vatId;
      }
      const email = optionalBody(createForm.email);
      if (email) body.email = email;
      const phone = optionalBody(createForm.phone);
      if (phone) body.phone = phone;
      const iban = optionalBody(createForm.iban);
      if (iban) body.iban = iban;
      const bic = optionalBody(createForm.bic);
      if (bic) body.bic = bic;
      const hrb = optionalBody(createForm.hrb);
      if (hrb) body.hrb = hrb;
      const managingDirector = optionalBody(createForm.managingDirector);
      if (managingDirector) body.managingDirector = managingDirector;

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

  function onCountryChange(country: CountryOption | null) {
    if (!country) return;
    setFieldError(null);
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

      <div className="flex flex-col gap-4">
        <p className="text-xl font-semibold leading-tight">
          {t("registry.sections.address")}
        </p>
        <div className="flex flex-col gap-1">
          <Label htmlFor="entity-street">{t("registry.street")}</Label>
          <Input
            id="entity-street"
            required
            aria-required
            placeholder={t("registry.street")}
            value={createForm.street}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                street: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="entity-address-line2">
            {t("registry.addressLine2")}
          </Label>
          <Input
            id="entity-address-line2"
            placeholder={t("registry.addressLine2")}
            value={createForm.addressLine2}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                addressLine2: event.target.value,
              }))
            }
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="entity-postal-code">{t("registry.postalCode")}</Label>
            <Input
              id="entity-postal-code"
              required
              aria-required
              placeholder={t("registry.postalCode")}
              value={createForm.postalCode}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  postalCode: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="entity-city">{t("registry.city")}</Label>
            <Input
              id="entity-city"
              required
              aria-required
              placeholder={t("registry.city")}
              value={createForm.city}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="entity-email">{t("registry.email")}</Label>
            <Input
              id="entity-email"
              type="email"
              placeholder={t("registry.email")}
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="entity-phone">{t("registry.phone")}</Label>
            <Input
              id="entity-phone"
              type="tel"
              placeholder={t("registry.phone")}
              value={createForm.phone}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-xl font-semibold leading-tight">
          {t("registry.sections.bank")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="entity-iban">{t("registry.iban")}</Label>
            <Input
              id="entity-iban"
              placeholder={t("registry.iban")}
              className="tabular-nums"
              value={createForm.iban}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  iban: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="entity-bic">{t("registry.bic")}</Label>
            <Input
              id="entity-bic"
              placeholder={t("registry.bic")}
              className="tabular-nums"
              value={createForm.bic}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  bic: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-xl font-semibold leading-tight">
          {t("registry.sections.management")}
        </p>
        <div className="flex flex-col gap-1">
          <Label htmlFor="entity-hrb">{t("registry.hrb")}</Label>
          <Input
            id="entity-hrb"
            placeholder={t("registry.hrb")}
            value={createForm.hrb}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                hrb: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="entity-managing-director">
            {t("registry.managingDirector")}
          </Label>
          <Input
            id="entity-managing-director"
            placeholder={t("registry.managingDirector")}
            value={createForm.managingDirector}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                managingDirector: event.target.value,
              }))
            }
          />
        </div>
      </div>

      {fieldError ? (
        <p className="text-xs text-destructive">{fieldError}</p>
      ) : null}
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
        </div>
      ) : null}
      <Button
        type="submit"
        disabled={submitting}
        className={PRIMARY_SUBMIT_CLASS}
      >
        {submitting ? <Spinner /> : t("registry.createSubmit")}
      </Button>
    </form>
  );

  return (
    <>
      <RegistryListPanel
        title={t("registry.entitiesTitle")}
        count={entities.length}
        searchPlaceholder={t("registry.search")}
        newButtonLabel={t("registry.newEntity")}
        canCreate={canCreate}
        createHint="Nur Inhaber können Entities anlegen."
        onNew={openCreate}
        rows={registryRows}
        rowTestId="entity-row"
        loading={loading}
        loadError={loadError}
        onRetry={() => void loadEntities()}
        emptyTitle={t("empty.entities.title")}
        emptyDescription={t("empty.entities.body")}
        emptyCtaLabel={t("empty.entities.cta")}
        selectedId={selectedId}
        onSelectRow={selectRow}
        panelMode={panelMode}
        onClosePanel={closePanel}
        selectedRow={selectedRow}
        nameColumnHeader={t("registry.entitiesTitle")}
        pillColumnHeader={t("registry.legalForm")}
        createPanel={null}
        detailTestId="entity-detail"
      />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[560px]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-[32px] leading-tight">
              {t("registry.newEntity")}
            </DialogTitle>
            <DialogDescription>{t("registry.entityModalBody")}</DialogDescription>
          </DialogHeader>
          {createPanel}
          <DialogFooter>
            <DialogClose className="inline-flex h-11 items-center rounded-lg border px-6 text-sm">
              {t("registry.cancel")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
