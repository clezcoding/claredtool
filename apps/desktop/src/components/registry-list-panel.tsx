import { Button, Card, CardContent, Input } from "@clared/ui";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ErrorState } from "./error-state";
import { Skeleton } from "./skeleton";
import { getCountryLabel } from "../data/legal-forms";

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

type RegistryListPanelProps = {
  title: string;
  count: number;
  countSingular: string;
  countPlural: string;
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
  selectedId: string | null;
  onSelectRow: (id: string) => void;
  panelMode: "none" | "detail" | "create";
  onClosePanel: () => void;
  selectedRow: RegistryListRow | undefined;
  pillColumnHeader: string;
  createPanel: ReactNode;
  detailTestId: string;
};

const DETAIL_TABS = [
  "Overview",
  "Details",
  "People",
  "Documents",
  "Activity",
] as const;

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

function defaultPeople(row: RegistryListRow): RegistryPerson[] {
  if (row.people?.length) return row.people;
  return [
    {
      name: "Anna Schmidt",
      title: "Managing Director",
      email: "anna.schmidt@example.de",
    },
    {
      name: "Thomas Weber",
      title: "Managing Director",
      email: "thomas.weber@example.de",
    },
    {
      name: "Laura Müller",
      title: "Managing Director",
      email: "laura.mueller@example.de",
    },
  ];
}

function defaultDocuments(row: RegistryListRow): RegistryDocument[] {
  if (row.documents?.length) return row.documents;
  return [{ name: "Invoice template" }, { name: "Trade register extract" }];
}

function defaultActivity(
  row: RegistryListRow,
  subjectLabel: string,
): RegistryActivity[] {
  if (row.activity?.length) return row.activity;
  return [
    { label: `${subjectLabel} created`, date: "12.01.2024" },
    { label: "VAT ID verified", date: "18.02.2024" },
    { label: "Address updated", date: "03.06.2024" },
  ];
}

function ActiveBadge({ status }: { status: "Active" | "Inactive" }) {
  if (status === "Inactive") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden />
        Inactive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
      <span
        className="size-1.5 rounded-full bg-green-600 dark:bg-green-400"
        aria-hidden
      />
      Active
    </span>
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
    <section className="border-b border-border/70 pb-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 py-2 text-left text-sm font-medium text-foreground"
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        {title}
      </button>
      {open ? <div className="flex flex-col gap-3 pt-1">{children}</div> : null}
    </section>
  );
}

export function RegistryListPanel({
  title,
  count,
  countSingular,
  countPlural,
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
  selectedId,
  onSelectRow,
  panelMode,
  onClosePanel,
  selectedRow,
  pillColumnHeader,
  createPanel,
  detailTestId,
}: RegistryListPanelProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] =
    useState<(typeof DETAIL_TABS)[number]>("Overview");

  useEffect(() => {
    setActiveTab("Overview");
  }, [selectedRow?.id]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.subtitle.toLowerCase().includes(query) ||
        row.pillLabel.toLowerCase().includes(query) ||
        getCountryLabel(row.countryIso).toLowerCase().includes(query),
    );
  }, [rows, search]);

  const countLabel = count === 1 ? `1 ${countSingular}` : `${count} ${countPlural}`;
  const pageEnd = filteredRows.length;
  const showPanel =
    panelMode === "create" || (panelMode === "detail" && selectedRow != null);
  const detailPeople = selectedRow ? defaultPeople(selectedRow) : [];
  const detailDocuments = selectedRow ? defaultDocuments(selectedRow) : [];
  const detailActivity = selectedRow
    ? defaultActivity(selectedRow, countSingular)
    : [];
  const detailStatus = selectedRow?.status ?? "Active";

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-auto p-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-serif text-[28px] font-semibold leading-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{countLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {rows.length > 0 ? (
              <>
                <div className="relative min-w-[220px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="min-h-11 border-border/70 bg-card pl-9 pr-16"
                  />
                  <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border/70 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 border-border/70 bg-card px-3"
                  aria-label="Filter"
                >
                  <Filter className="size-4" />
                </Button>
              </>
            ) : null}
            <div className="ml-auto flex flex-col items-end gap-1">
              <Button
                type="button"
                disabled={!canCreate}
                onClick={canCreate ? onNew : undefined}
                aria-label="Anlegen"
                className="min-h-11 font-semibold bg-foreground text-background hover:bg-foreground/90 dark:border dark:border-border/70 dark:bg-transparent dark:text-foreground dark:hover:bg-muted"
              >
                {newButtonLabel}
              </Button>
              {!canCreate ? (
                <p className="text-xs text-muted-foreground">{createHint}</p>
              ) : null}
            </div>
          </div>
        </header>

        {loadError ? (
          <ErrorState onRetry={onRetry} />
        ) : loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex max-w-xl flex-col gap-4 text-sm">
            <img
              src="/empty-entities.png"
              alt=""
              className="w-full max-w-xl rounded-md"
            />
            <p className="font-semibold text-foreground">{emptyTitle}</p>
            <p className="text-muted-foreground">{emptyDescription}</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border border-border/70">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        className="size-4 rounded border-border/70"
                      />
                    </th>
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">{pillColumnHeader}</th>
                    <th className="px-3 py-3 font-medium">Country</th>
                    <th className="px-3 py-3 font-medium">Tax ID</th>
                    <th className="w-10 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-border/70 last:border-b-0 ${
                        selectedId === row.id ? "bg-primary/20" : "hover:bg-muted/40"
                      }`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${row.name}`}
                          className="size-4 rounded border-border/70"
                          onClick={(event) => event.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          data-testid={rowTestId}
                          aria-current={selectedId === row.id ? "true" : undefined}
                          onClick={() => onSelectRow(row.id)}
                          className="flex w-full items-center gap-3 text-left"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
                            {initials(row.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-foreground">
                              {row.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {row.subtitle || "—"}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-foreground">
                          {row.pillLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden>{countryFlag(row.countryIso)}</span>
                          {getCountryLabel(row.countryIso)}
                        </span>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">
                        {row.taxId ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          aria-label={`Actions for ${row.name}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              {pageEnd === 0
                ? "0 of 0"
                : `1-${pageEnd} of ${filteredRows.length}`}
            </p>
          </>
        )}
      </div>

      {showPanel ? (
        <Card
          data-testid={detailTestId}
          className="w-[420px] shrink-0 rounded-none border-y-0 border-r-0 border-border/70"
        >
          {panelMode === "create" ? (
            <CardContent className="flex flex-col gap-4 pt-6">{createPanel}</CardContent>
          ) : selectedRow ? (
            <CardContent className="flex flex-col gap-4 p-0">
              <div className="flex items-start justify-between border-b border-border/70 px-6 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-semibold text-foreground">
                    {initials(selectedRow.name)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-xl font-semibold text-foreground">
                      {selectedRow.name}
                    </h2>
                    <ActiveBadge status={detailStatus} />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Close panel"
                  onClick={onClosePanel}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="flex gap-1 overflow-x-auto border-b border-border/70 px-4">
                {DETAIL_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 border-b-2 px-3 py-2 text-sm ${
                      activeTab === tab
                        ? "border-foreground font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4 px-6 pb-6 pt-2 text-sm">
                {activeTab === "Overview" ? (
                  <>
                    <CollapsibleSection title="General Information">
                      <dl className="grid gap-3">
                        <div>
                          <dt className="text-muted-foreground">{pillColumnHeader}</dt>
                          <dd className="font-medium text-foreground">
                            {selectedRow.pillLabel}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Country</dt>
                          <dd className="text-foreground">
                            {countryFlag(selectedRow.countryIso)}{" "}
                            {getCountryLabel(selectedRow.countryIso)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Tax ID</dt>
                          <dd className="tabular-nums text-foreground">
                            {selectedRow.taxId ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </CollapsibleSection>

                    <CollapsibleSection title="Registered Address">
                      <p className="text-foreground">{selectedRow.address}</p>
                      <div className="flex h-28 items-center justify-center rounded-md border border-border/70 bg-muted/40 text-xs text-muted-foreground">
                        Map preview
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Management contacts" defaultOpen={false}>
                      <ul className="flex flex-col gap-2">
                        {detailPeople.slice(0, 2).map((person) => (
                          <li
                            key={person.name}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
                              {initials(person.name)}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-medium text-foreground">
                                {person.name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {person.title}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleSection>

                    {selectedRow.linkedAccount ? (
                      <CollapsibleSection title="Linked Accounts" defaultOpen={false}>
                        <button
                          type="button"
                          className="text-left text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {selectedRow.linkedAccount}
                        </button>
                      </CollapsibleSection>
                    ) : null}
                  </>
                ) : activeTab === "Details" ? (
                  <dl className="grid gap-4">
                    <div>
                      <dt className="text-muted-foreground">Legal Name</dt>
                      <dd className="font-medium text-foreground">
                        {selectedRow.legalName ?? selectedRow.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Registration Number</dt>
                      <dd className="tabular-nums text-foreground">
                        {selectedRow.registrationNumber ?? "HRB 123456"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Incorporation Date</dt>
                      <dd className="tabular-nums text-foreground">
                        {selectedRow.incorporationDate ?? "15.03.2019"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Fiscal Year End</dt>
                      <dd className="tabular-nums text-foreground">
                        {selectedRow.fiscalYearEnd ?? "31.12"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <ActiveBadge status={detailStatus} />
                      </dd>
                    </div>
                  </dl>
                ) : activeTab === "People" ? (
                  <ul className="flex flex-col gap-3">
                    {detailPeople.map((person) => (
                      <li
                        key={person.name}
                        className="flex items-center gap-3 rounded-md border border-border/70 p-3 dark:border-border"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
                          {initials(person.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{person.name}</p>
                          <p className="text-xs text-muted-foreground">{person.title}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground"
                          aria-label={`Email ${person.name}`}
                        >
                          <Mail className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : activeTab === "Documents" ? (
                  <ul className="flex flex-col gap-2">
                    {detailDocuments.map((doc) => (
                      <li
                        key={doc.name}
                        className="flex items-center gap-3 rounded-md border border-border/70 px-3 py-2.5 dark:border-border"
                      >
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {doc.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="relative flex flex-col gap-5 pl-4 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border/70 dark:before:bg-border">
                    {detailActivity.map((event) => (
                      <li key={event.label} className="relative">
                        <span
                          className="absolute -left-4 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
                          aria-hidden
                        />
                        <p className="font-medium text-foreground">{event.label}</p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {event.date}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </CardContent>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
