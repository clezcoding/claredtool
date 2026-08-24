import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@clared/ui";
import { ChevronUp } from "lucide-react";
import type { MeResponse } from "../auth/types";

export const ROLE_LABELS: Record<string, string> = {
  platform: "Plattform",
  owner: "Inhaber",
  admin: "Admin",
  accountant: "Buchhaltung",
  tax: "Steuer",
  clerk: "Sachbearbeitung",
  auditor: "Prüfung",
  viewer: "Ansicht",
};

export function roleLabel(primaryRole: string): string {
  return ROLE_LABELS[primaryRole] ?? primaryRole;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

const CHIP_CLASS =
  "flex w-full min-h-11 items-center justify-start gap-2 rounded-md border-0 bg-transparent px-2 text-left font-normal text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SessionChip({
  me,
  onLogout,
}: {
  me: MeResponse;
  onLogout?: () => void;
}) {
  const name = me.name.trim() || me.email;
  const label = roleLabel(me.primaryRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" aria-label={name} aria-haspopup="menu" className={CHIP_CLASS}>
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/40 text-xs font-semibold text-foreground"
          >
            {initials(name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm" title={name}>
              {name}
            </span>
            <Badge
              variant="secondary"
              className="mt-0.5 rounded-md text-xs font-normal leading-[1.4]"
            >
              {label}
            </Badge>
          </span>
          <ChevronUp size={14} className="shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="rounded-md">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-foreground">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            Rolle: {label}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onLogout?.()}>Abmelden</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
