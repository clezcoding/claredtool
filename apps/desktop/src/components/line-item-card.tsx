import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@clared/ui";
import { Code2, GripVertical, Pencil, Star, X } from "lucide-react";
import type { LineItem } from "../data/sample-invoice";

const CATEGORIES = {
  beratung: {
    label: "Beratung",
    subtitle: "Beratung & Konzept",
    Icon: Star,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
  design: {
    label: "Design",
    subtitle: "Design & UX",
    Icon: Pencil,
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    iconClassName: "text-orange-600 dark:text-orange-400",
  },
  entwicklung: {
    label: "Entwicklung",
    subtitle: "Entwicklung & Integration",
    Icon: Code2,
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    iconClassName: "text-green-600 dark:text-green-400",
  },
} as const;

type CategoryId = keyof typeof CATEGORIES;

function splitBezeichnung(value: string): [string, string | null] {
  const newline = value.indexOf("\n");
  if (newline === -1) return [value, null];
  return [value.slice(0, newline), value.slice(newline + 1)];
}

export function LineItemCard({
  item,
  index,
  taxPercent,
  kategorie = "beratung",
  onChange,
  onKategorieChange,
  onDelete,
  readOnly = false,
}: {
  item: LineItem;
  index: number;
  taxPercent: number;
  kategorie?: CategoryId;
  onChange?: (next: LineItem) => void;
  onKategorieChange?: (kategorie: CategoryId) => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const netto = item.menge * item.einzelpreis;
  const category = CATEGORIES[kategorie] ?? CATEGORIES.beratung;
  const CategoryIcon = category.Icon;
  const [title, inlineSubtitle] = splitBezeichnung(item.bezeichnung);
  const subtitle = inlineSubtitle ?? category.subtitle;

  return (
    <tr data-testid="line-item-card" className="border-b border-border/80">
      <td className="py-3 pr-2">
        <div className="flex items-center gap-1.5">
          <GripVertical
            size={14}
            className="shrink-0 text-muted-foreground/60"
            aria-hidden
          />
          <span className="text-xs tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </td>
      <td className="py-3 pr-2">
        <span className="sr-only">Bezeichnung</span>
        {readOnly ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{title}</span>
            {subtitle ? (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <Input
              value={title}
              placeholder="Beschreibung"
              onChange={(event) => {
                const nextTitle = event.target.value;
                const nextBezeichnung = inlineSubtitle
                  ? `${nextTitle}\n${inlineSubtitle}`
                  : nextTitle;
                onChange?.({
                  ...item,
                  bezeichnung: nextBezeichnung,
                  netto: item.menge * item.einzelpreis,
                });
              }}
              className="h-8 border-0 bg-transparent px-0 text-sm font-semibold shadow-none"
            />
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
        )}
      </td>
      <td className="py-3 pr-2">
        <span className="sr-only">Kategorie</span>
        {readOnly ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${category.className}`}
          >
            <CategoryIcon size={12} className={category.iconClassName} />
            {category.label}
          </span>
        ) : (
          <Select
            value={kategorie}
            onValueChange={(value) =>
              onKategorieChange?.(value as CategoryId)
            }
          >
            <SelectTrigger className="h-8 w-auto border-0 bg-transparent p-0 shadow-none">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${category.className}`}
              >
                <CategoryIcon size={12} className={category.iconClassName} />
                {category.label}
              </span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([id, meta]) => {
                const Icon = meta.Icon;
                return (
                  <SelectItem key={id} value={id}>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon size={12} />
                      {meta.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </td>
      <td className="py-3 pr-2">
        <span className="sr-only">Menge</span>
        {readOnly ? (
          <span className="tabular-nums text-sm">{item.menge}</span>
        ) : (
          <Input
            type="number"
            min={0}
            value={item.menge || ""}
            onChange={(event) => {
              const menge = Number(event.target.value) || 0;
              onChange?.({
                ...item,
                menge,
                netto: menge * item.einzelpreis,
              });
            }}
            className="h-9 w-20 border-0 bg-transparent px-0 tabular-nums shadow-none"
          />
        )}
      </td>
      <td className="py-3 pr-2 text-sm text-muted-foreground">Stk</td>
      <td className="py-3 pr-2">
        <span className="sr-only">Einzelpreis</span>
        {readOnly ? (
          <span className="tabular-nums text-sm">{item.einzelpreis.toFixed(2)}</span>
        ) : (
          <Input
            type="number"
            min={0}
            step="0.01"
            value={item.einzelpreis || ""}
            onChange={(event) => {
              const einzelpreis = Number(event.target.value) || 0;
              onChange?.({
                ...item,
                einzelpreis,
                netto: item.menge * einzelpreis,
              });
            }}
            className="h-9 w-24 border-0 bg-transparent px-0 tabular-nums shadow-none"
          />
        )}
      </td>
      <td className="py-3 pr-2 text-sm tabular-nums text-muted-foreground">
        {taxPercent}%
      </td>
      <td className="py-3 pr-2 text-right">
        <span className="sr-only">Netto</span>
        <div className="flex items-center justify-end gap-2">
          <span className="break-words whitespace-normal text-sm tabular-nums">
            {netto.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Position löschen"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
