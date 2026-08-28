import { Button, Card, CardContent, Input } from "@clared/ui";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getCountryLabel } from "../data/legal-forms";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { MaterialIcon } from "./material-icon";
import { Skeleton } from "./skeleton";

export type RegistryPerson = {
  name: string;
  title: string;
  email: string;
};

export type RegistryDocument = {
  name: string;
};

export type RegistryActivity = {
  label: string;
  date: string;
};

export type RegistryListRow = {
  id: string;
  name: string;
  subtitle: string;
  pillLabel: string;
  countryIso: string;
  address: string;
  taxId: string | null;
  linkedAccount?: string;
  legalName?: string;
  registrationNumber?: string;
  incorporationDate?: string;
  fiscalYearEnd?: string;
  status?: "Active" | "Inactive";
  people?: RegistryPerson[];
  documents?: RegistryDocument[];
  activity?: RegistryActivity[];
};

export type RegistryDetailTab = "master" | "tax" | "bank";

export interface RegistryListPanelProps {
  title: string;
  count: number;
  searchPlaceholder: string;
  newButtonLabel: string;
  canCreate: boolean;
  createHint: string;
  onNew: () => void;
  rows: RegistryListRow[];
  rowTestId: string;
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription: string;
  emptyCtaLabel?: string;
  selectedId: string | null;
  onSelectRow: (id: string) => void;
  panelMode: "none" | "detail" | "create";
  onClosePanel: () => void;
  selectedRow: RegistryListRow | undefined;
  nameColumnHeader: string;
  pillColumnHeader: string;
  createPanel: ReactNode;
  detailTestId: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

function countryFlag(iso: string): string {
  if (iso.length !== 2) return "🏳️";
  const code = iso.toUpperCase();
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0)),
  );
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between bg-muted/30 p-4 text-left text-sm font-medium text-foreground hover:bg-muted/50"
      >
        {title}
        <MaterialIcon
          ligature="expand_more"
          className={`text-[20px] text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border/70 p-4 pt-2">{children}</div>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] text-muted-foreground">{label}</p>
      <p className="min-h-11 rounded-lg border border-border/70 bg-card px-3 py-2.5 text-sm text-foreground">
        {value}
      </p>
    </div>
  );
}

export function RegistryListPanel({
  title,
  count,
  searchPlaceholder,
  newButtonLabel,
  canCreate,
  createHint,
  onNew,
  rows,
  rowTestId,
  loading,
  loadError,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  selectedId,
  onSelectRow,
  panelMode,
  onClosePanel,
  selectedRow,
  nameColumnHeader,
  pillColumnHeader,
  createPanel,
  detailTestId,
}: RegistryListPanelProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [activeTab, setActiveTab] = useState<RegistryDetailTab>("master");
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveTab("master");
  }, [selectedRow?.id]);

  const filterOptions = useMemo(() => {
    const labels = [...new Set(rows.map((row) => row.pillLabel).filter(Boolean))];
    return labels.sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filterValue !== "all" && row.pillLabel !== filterValue) return false;
      if (!query) return true;
      return (
        row.name.toLowerCase().includes(query) ||
        row.subtitle.toLowerCase().includes(query) ||
        row.pillLabel.toLowerCase().includes(query) ||
        getCountryLabel(row.countryIso).toLowerCase().includes(query)
      );
    });
  }, [rows, search, filterValue]);

  const countLabel = t("counter", { count });
  const pageEnd = filteredRows.length;
  const showPanel =
    panelMode === "create" || (panelMode === "detail" && selectedRow != null);
  const detailStatus = selectedRow?.status ?? "Active";
  const allChecked =
    filteredRows.length > 0 && filteredRows.every((row) => checkedIds.has(row.id));

  function toggleAll() {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(filteredRows.map((row) => row.id)));
  }

  function toggleRow(id: string) {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const DETAIL_TABS: { id: RegistryDetailTab; label: string }[] = [
    { id: "master", label: t("registry.tabs.master") },
    { id: "tax", label: t("registry.tabs.tax") },
    { id: "bank", label: t("registry.tabs.bank") },
  ];

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col overflow-auto p-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-semibold leading-[34px] text-foreground">
              {title}
            </h1>
            <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[12px] text-muted-foreground">
              {countLabel}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button
              type="button"
              disabled={!canCreate}
              onClick={canCreate ? onNew : undefined}
              className="flex h-10 items-center gap-2 bg-primary-container px-4 font-medium text-white hover:bg-primary-container/90"
            >
              <MaterialIcon ligature="add" className="text-[18px]" />
              {newButtonLabel}
            </Button>
            {!canCreate ? (
              <p className="text-xs text-muted-foreground">{createHint}</p>
            ) : null}
          </div>
        </header>

        {loadError ? (
          <ErrorState onRetry={onRetry} />
        ) : loading ? (
          <div data-testid="list-panel-loading" className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            ctaLabel={emptyCtaLabel}
            onCta={emptyCtaLabel ? onNew : undefined}
            ctaDisabled={!canCreate}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <div className="relative min-w-[220px]">
                  <MaterialIcon
                    ligature="search"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground"
                  />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-9 border-border/70 bg-background pl-9 text-[13px]"
                  />
                </div>
                <label className="sr-only" htmlFor="registry-filter">
                  {t("registry.filter")}
                </label>
                <select
                  id="registry-filter"
                  aria-label={t("registry.filter")}
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                  className="h-8 rounded border border-border/70 bg-card px-3 text-[12px] font-medium text-muted-foreground"
                >
                  <option value="all">{t("registry.filterAll")}</option>
                  {filterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-expanded={columnsOpen}
                  onClick={() => setColumnsOpen((current) => !current)}
                  className="flex h-8 items-center gap-1.5 rounded border border-border/70 bg-card px-3 text-[12px] font-medium text-muted-foreground"
                >
                  <MaterialIcon ligature="view_column" className="text-[16px]" />
                  {t("registry.columns")}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span>
                  {pageEnd === 0
                    ? t("registry.pagination", { from: 0, to: 0, total: 0 })
                    : t("registry.pagination", {
                        from: 1,
                        to: pageEnd,
                        total: filteredRows.length,
                      })}
                </span>
                <div className="flex overflow-hidden rounded border border-border/70">
                  <button
                    type="button"
                    disabled
                    className="flex size-8 items-center justify-center disabled:opacity-50"
                    aria-label={t("registry.prevPage")}
                  >
                    <MaterialIcon ligature="chevron_left" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex size-8 items-center justify-center border-l border-border/70 disabled:opacity-50"
                    aria-label={t("registry.nextPage")}
                  >
                    <MaterialIcon ligature="chevron_right" className="text-[16px]" />
                  </button>
                </div>
              </div>
            </div>

            {columnsOpen ? (
              <p className="border-b border-border/70 px-4 py-2 text-xs text-muted-foreground">
                {t("registry.columnsHint")}
              </p>
            ) : null}

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="w-12 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={t("registry.selectAll")}
                        checked={allChecked}
                        onChange={toggleAll}
                        className="size-4 rounded border-border/70"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">{nameColumnHeader}</th>
                    <th className="px-4 py-3 font-medium">{pillColumnHeader}</th>
                    <th className="px-4 py-3 font-medium">{t("registry.country")}</th>
                    <th className="px-4 py-3 text-right font-medium">{t("registry.taxId")}</th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const selected = selectedId === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`group h-16 cursor-pointer border-b border-border/70 last:border-b-0 ${
                          selected
                            ? "relative bg-brand-soft/30 hover:bg-brand-soft/40 after:absolute after:inset-y-0 after:left-0 after:w-[3px] after:rounded-r after:bg-primary-container after:content-['']"
                            : "hover:bg-muted/40"
                        }`}
                        onClick={() => onSelectRow(row.id)}
                      >
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            aria-label={t("registry.selectRow", { name: row.name })}
                            checked={checkedIds.has(row.id)}
                            onChange={() => toggleRow(row.id)}
                            onClick={(event) => event.stopPropagation()}
                            className="size-4 rounded border-border/70"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            data-testid={rowTestId}
                            aria-current={selected ? "true" : undefined}
                            onClick={() => onSelectRow(row.id)}
                            className="flex w-full items-center gap-3 text-left"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted text-xs font-semibold text-foreground">
                              {initials(row.name)}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-medium text-foreground">
                                {row.name}
                              </span>
                              <span className="block truncate text-[12px] text-muted-foreground">
                                {row.subtitle || "—"}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-flex rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            {row.pillLabel}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <span aria-hidden className="text-[16px] leading-none">
                              {countryFlag(row.countryIso)}
                            </span>
                            <span className="text-[13px]">
                              {getCountryLabel(row.countryIso)}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                          {row.taxId ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted"
                            aria-label={t("registry.rowActions", { name: row.name })}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MaterialIcon ligature="more_vert" className="text-[20px]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showPanel ? (
        <Card
          data-testid={detailTestId}
          className="w-[400px] shrink-0 overflow-hidden rounded-none border-y-0 border-r-0 border-border/70"
        >
          {panelMode === "create" ? (
            <CardContent className="flex flex-col gap-4 pt-6">{createPanel}</CardContent>
          ) : selectedRow ? (
            <CardContent className="flex h-full flex-col gap-0 p-0">
              <div className="border-b border-border/70 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted text-lg font-semibold text-foreground">
                    {initials(selectedRow.name)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-full border border-border/70 text-muted-foreground"
                      aria-label={t("registry.edit")}
                    >
                      <MaterialIcon ligature="edit" className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground"
                      aria-label={t("registry.close")}
                      onClick={onClosePanel}
                    >
                      <MaterialIcon ligature="close" className="text-[20px]" />
                    </button>
                  </div>
                </div>
                <h2 className="mb-1 text-lg font-semibold text-foreground">
                  {selectedRow.name}
                </h2>
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="inline-flex rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] uppercase tracking-wider">
                    {selectedRow.pillLabel}
                  </span>
                  <span className="size-1 rounded-full bg-border" />
                  <span>
                    {detailStatus === "Inactive"
                      ? t("registry.statusInactive")
                      : t("registry.statusActive")}
                  </span>
                </div>
              </div>

              <div className="flex border-b border-border/70 px-2 pt-2">
                {DETAIL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 border-b-2 px-1 pt-2 pb-3 text-sm ${
                      activeTab === tab.id
                        ? "border-primary-container font-medium text-primary-container"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-muted/20 p-6">
                {activeTab === "master" ? (
                  <>
                    <CollapsibleSection title={t("registry.sections.general")}>
                      <Field
                        label={t("registry.legalName")}
                        value={selectedRow.legalName ?? selectedRow.name}
                      />
                      <Field label={pillColumnHeader} value={selectedRow.pillLabel} />
                      <Field
                        label={t("registry.country")}
                        value={getCountryLabel(selectedRow.countryIso)}
                      />
                    </CollapsibleSection>
                    <CollapsibleSection title={t("registry.sections.address")}>
                      <Field
                        label={t("registry.address")}
                        value={selectedRow.address || "—"}
                      />
                    </CollapsibleSection>
                    <CollapsibleSection
                      title={t("registry.sections.management")}
                      defaultOpen={false}
                    >
                      {selectedRow.people?.length ? (
                        <ul className="flex flex-col gap-2">
                          {selectedRow.people.map((person) => (
                            <li key={person.name} className="text-sm">
                              <span className="font-medium text-foreground">{person.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {person.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">—</p>
                      )}
                    </CollapsibleSection>
                  </>
                ) : activeTab === "tax" ? (
                  <CollapsibleSection title={t("registry.tabs.tax")}>
                    <Field label={t("registry.vatId")} value={selectedRow.taxId ?? "—"} />
                    <Field
                      label={t("registry.taxNumber")}
                      value={selectedRow.registrationNumber ?? "—"}
                    />
                  </CollapsibleSection>
                ) : (
                  <CollapsibleSection title={t("registry.sections.bank")}>
                    <Field
                      label={t("registry.accountHolder")}
                      value={selectedRow.legalName ?? selectedRow.name}
                    />
                    <Field label={t("registry.bankName")} value="—" />
                    <Field label={t("registry.iban")} value="—" />
                    <Field label={t("registry.bic")} value="—" />
                  </CollapsibleSection>
                )}
              </div>
            </CardContent>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
