# Phase 1: Tauri Desktop & Mockup-First UI — Pattern Map

**Mapped:** 2026-08-19
**Files analyzed:** 27 (to be created)
**Analogs found:** 0 / 27 — greenfield project; no existing code in repo

> All patterns sourced from RESEARCH.md code examples and canonical docs. Line refs below are `01-RESEARCH.md` unless noted.

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `pnpm-workspace.yaml` | config | — | none | — |
| `package.json` (root) | config | — | none | — |
| `apps/desktop/package.json` | config | — | none | — |
| `apps/desktop/vite.config.ts` | config | — | none | — |
| `apps/desktop/tsconfig.json` | config | — | none | — |
| `apps/desktop/index.html` | entry | — | none | — |
| `apps/desktop/src/main.tsx` | entry | request-response | none | — |
| `apps/desktop/src/App.tsx` | component / router | request-response | none | — |
| `apps/desktop/src/routes/rechnung.tsx` | component | request-response + CRUD (local state) | none | — |
| `apps/desktop/src/routes/entities.tsx` | component | request-response | none | — |
| `apps/desktop/src/routes/kunden.tsx` | component | request-response | none | — |
| `apps/desktop/src/routes/tax.tsx` | component | request-response | none | — |
| `apps/desktop/src/routes/pdf.tsx` | component | request-response | none | — |
| `apps/desktop/src/data/sample-invoice.ts` | data module | transform | none | — |
| `apps/desktop/src/styles/globals.css` | config / styles | — | none | — |
| `apps/desktop/public/empty-state-hero.png` | static asset | — | none | — |
| `apps/desktop/vitest.config.ts` | config / test | — | none | — |
| `apps/desktop/src/__tests__/routes.test.tsx` | test | request-response | none | — |
| `apps/desktop/src/__tests__/invoice.test.tsx` | test | transform | none | — |
| `apps/desktop/src-tauri/Cargo.toml` | config (Rust) | — | none | — |
| `apps/desktop/src-tauri/tauri.conf.json` | config (Tauri) | — | none | — |
| `apps/desktop/src-tauri/src/lib.rs` | entry (Rust) | — | none | — |
| `packages/ui/package.json` | config | — | none | — |
| `packages/ui/tsconfig.json` | config | — | none | — |
| `packages/ui/components.json` | config (shadcn) | — | none | — |
| `packages/ui/src/index.ts` | barrel export | — | none | — |
| `packages/ui/src/styles/globals.css` | config / styles | — | none | — |

---

## Pattern Assignments

> Source refs use format `(RESEARCH.md L<start>–<end>)`.

---

### `pnpm-workspace.yaml` (config)

**Pattern source:** RESEARCH.md L267–274 (Pattern 1)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

### `apps/desktop/src-tauri/tauri.conf.json` (config, Tauri)

**Pattern source:** RESEARCH.md L276–309 (Pattern 2)

```json
{
  "productName": "Clared",
  "identifier": "com.clared.app",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Clared",
        "width": 1280,
        "height": 800,
        "resizable": true,
        "decorations": true
      }
    ],
    "security": { "csp": null }
  },
  "bundle": {
    "active": true,
    "icon": ["icons/32x32.png", "icons/128x128.png"]
  }
}
```

**Critical:** Tauri v2 uses `app.windows[]` not `tauri.windows[]` (v1). Scaffolded template generates correct v2 format automatically.

---

### `apps/desktop/src/App.tsx` (component, request-response)

**Pattern source:** RESEARCH.md L313–336 (Pattern 3 — HashRouter routing)

```tsx
import { createHashRouter, RouterProvider } from "react-router";

const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <RechnungScreen /> },
      { path: "entities", element: <EntitiesScreen /> },
      { path: "kunden", element: <KundenScreen /> },
      { path: "tax", element: <TaxScreen /> },
      { path: "pdf", element: <PdfScreen /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

**Why HashRouter:** Tauri serves from `tauri://localhost` / `https://tauri.localhost`; sub-route navigation without a server 404s with BrowserRouter.

---

### `apps/desktop/src/main.tsx` (entry, request-response)

**Pattern source:** RESEARCH.md L358–365 (dark mode init from Pattern 4)

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

// Dark-first: hardcoded, no toggle in Phase 1 (D-09)
document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Do not:** use `localStorage` for dark mode — no persist in Phase 1.

---

### `apps/desktop/src/styles/globals.css` + `packages/ui/src/styles/globals.css` (styles)

**Pattern source:** RESEARCH.md L349–357 (Pattern 4 — shadcn dark mode init)

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
```

**Do not:** create `tailwind.config.js` — Tailwind v4 is CSS-first; no config file.

---

### `packages/ui/package.json` + `packages/ui/src/index.ts` (config + barrel export)

**Pattern source:** RESEARCH.md L368–393 (Pattern 5 — cross-package imports)

```json
// packages/ui/package.json
{
  "name": "@clared/ui",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

```json
// apps/desktop/package.json — dependency entry
{
  "dependencies": {
    "@clared/ui": "workspace:*"
  }
}
```

```typescript
// apps/desktop/src/routes/rechnung.tsx — import pattern
import { Button, Card } from "@clared/ui";
```

**Note:** Point `exports` at `./src/index.ts` (TypeScript source). Vite resolves it at dev time — no build step needed in `packages/ui`.

---

### `apps/desktop/src/App.tsx` — AppShell component (component, request-response)

**Pattern source:** RESEARCH.md L503–543 (sidebar layout with Outlet)

```tsx
import { NavLink, Outlet } from "react-router";
import { FileText, Building2, Users, Calculator, FileImage } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Rechnung", icon: FileText },
  { to: "/entities", label: "Entities", icon: Building2 },
  { to: "/kunden", label: "Kunden", icon: Users },
  { to: "/tax", label: "Tax", icon: Calculator },
  { to: "/pdf", label: "PDF", icon: FileImage },
];

export function AppShell() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <nav className="w-48 shrink-0 border-r border-border flex flex-col gap-1 p-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm
               ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

---

### `apps/desktop/src/data/sample-invoice.ts` (data module, transform)

**Pattern source:** RESEARCH.md L545–563 — but field names corrected against canonical spec below.

**⚠ Field name discrepancy resolved:**
RESEARCH.md L545–563 uses simplified names (`rate`, `reverse_charge`, `legal_text`). The canonical spec at `docs/clared-tax-engine-architecture.md` L37–49 defines:

| RESEARCH.md (simplified) | Canonical (`clared-tax-engine-architecture.md`) |
|--------------------------|--------------------------------------------------|
| `rate` | `invoice_tax_rate` |
| `reverse_charge` | `reverse_charge_flag` |
| `legal_text` | `legal_reference` |
| — | `place_of_supply_country` |
| — | `tax_liability_party` |
| — | `invoice_tax_shown` |
| — | `invoice_text_block_id` |
| `applied_rule_id` | `applied_rule_id` ✓ |
| — | `applied_rule_version` |

**Use canonical field names.** Staged mock interface:

```typescript
// src/data/sample-invoice.ts

interface StagedTaxDecision {
  place_of_supply_country: string;
  tax_liability_party: "supplier" | "customer";
  invoice_tax_rate: number;
  invoice_tax_shown: boolean;
  reverse_charge_flag: boolean;
  legal_reference: string;
  invoice_text_block_id: string;
  applied_rule_id: string;
  applied_rule_version: string;
}

interface LineItem {
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  netto: number;
}

interface SampleInvoice {
  rechnungsnummer: string;
  datum: string;
  faellig: string;
  seller: { name: string; address: string; ustid: string };
  buyer: { name: string; address: string; country: string };
  lineItems: LineItem[];
  taxDecision: StagedTaxDecision;
  nettoGesamt: number;
  bruttoGesamt: number;
}
```

Sample data: EU-GmbH seller (D-12) + US customer (D-30), reverse charge applies.

---

### `apps/desktop/src/routes/rechnung.tsx` (component, request-response + local CRUD)

**Pattern source:** RESEARCH.md L565–597 (LineItemCard component) + AppShell pattern above.

**Split layout rule (D-14):** left panel = invoice form + line-item cards; right rail = TaxDecision staged fields + PDF peek link.

```tsx
// Line-item card — inline hover-delete, four fields always visible (D-17–D-21)
import { X } from "lucide-react";

function LineItemCard({ item, onDelete }: { item: LineItem; onDelete: () => void }) {
  return (
    <div className="group relative rounded-md border border-border bg-card p-3">
      <button
        onClick={onDelete}
        className="absolute right-2 top-2 hidden group-hover:flex"
        aria-label="Position löschen"
      >
        <X size={14} className="text-destructive" />
      </button>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <span>{item.bezeichnung}</span>
        <span>{item.menge}</span>
        <span>{item.einzelpreis.toFixed(2)}</span>
        <span>{item.netto.toFixed(2)}</span>
      </div>
    </div>
  );
}
```

**State pattern:** `useState<LineItem[]>(SAMPLE_INVOICE.lineItems)` for the mock; toggle empty via `useState<boolean>(false)` gated by „Neue Rechnung" header button.

---

### `apps/desktop/src/routes/entities.tsx` + `kunden.tsx` (component, request-response)

**Pattern:** List + read-only detail on click (D-29). Disabled „Anlegen" button with hint (D-31).

```tsx
// Disabled create button pattern (copy for both routes)
<Button disabled title="Wird in Phase 3 aktiviert">
  Anlegen
</Button>
// Show a visible tooltip/caption under or beside the button: "Wird in Phase 3 aktiviert"
```

One sample row each (D-30): entities = EU-GmbH from sample-invoice; kunden = US customer from sample-invoice. Click toggles a local `selectedId` state showing a read-only panel — no navigation, no dialog.

---

### `apps/desktop/src/routes/pdf.tsx` (component, request-response)

**Pattern source:** D-27, D-28. Light paper on dark stage; no real PDF binary.

```tsx
// Paper mock — HTML/CSS (D-26, D-27)
// Light page centered on dark background; decorative zoom controls
<div className="flex flex-col items-center justify-center h-full bg-background py-8">
  <div className="shadow-2xl rounded-sm border border-border/20"
       style={{ background: "#fff", width: 595, minHeight: 842, padding: "48px 56px" }}>
    {/* render invoice fields from SAMPLE_INVOICE here — numbers stay consistent */}
  </div>
  {/* Decorative zoom bar below paper */}
</div>
```

**Do not:** invert PDF content; switch app to light theme; use PDF.js (D-26).

---

### `apps/desktop/public/empty-state-hero.png` (static asset)

**Pattern source:** RESEARCH.md L395–403 (Pattern 6 — Higgsfield CLI)

```bash
higgsfield generate create gpt_image_2 \
  --prompt "Minimalist dark UI illustration: a crisp B2B invoice document floating on a deep navy background. Clean geometric shapes, subtle glow. Professional, calm, dense. No people. No text." \
  --wait
# Save returned URL → apps/desktop/public/empty-state-hero.png
```

Check auth first: `higgsfield account status`. If unauthenticated, save placeholder PNG and unblock UI layout work.

---

### `apps/desktop/src/__tests__/routes.test.tsx` + `invoice.test.tsx` (tests)

**Pattern source:** RESEARCH.md L694–710 (Wave 0 Gaps + Validation Architecture)

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

Test install: `pnpm add -D vitest @testing-library/react jsdom` inside `apps/desktop`.

Covers:
- `routes.test.tsx` → UI-01: 5 sidebar routes navigable
- `invoice.test.tsx` → UI-01: sample invoice renders (seller EU-GmbH, buyer US); empty state renders on „Neue Rechnung"

---

## Shared Patterns

### Dark-First Theme Bootstrap
**Source:** RESEARCH.md L358–365 (Pattern 4)
**Apply to:** `apps/desktop/src/main.tsx`

```tsx
document.documentElement.classList.add("dark");
```

No `localStorage`, no toggle, no ThemeProvider in Phase 1.

---

### Tailwind v4 CSS Import
**Source:** RESEARCH.md L349–357 (Pattern 4)
**Apply to:** Both `globals.css` files

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@custom-variant dark (&:is(.dark *));
```

---

### Cross-Package Import Convention
**Source:** RESEARCH.md L368–393 (Pattern 5)
**Apply to:** All `apps/desktop/src/routes/*.tsx` and component files

```typescript
import { Button, Card, Input, Badge } from "@clared/ui";
import { FileText, X, Building2 } from "lucide-react";
```

---

### German Copy Strings
**Source:** UI-SPEC `## Copywriting Contract`
**Apply to:** All route components

Key strings (do not translate, do not change):
- Primary CTA: `"Neue Rechnung"`
- Add line: `"+ Position"`
- Disabled create hint: `"Wird in Phase 3 aktiviert"`
- Tax rail heading: `"Live Steuerberechnung"`
- PDF peek label: `"Vorschau"`
- Invoice labels: `"Rechnungsnummer · Datum · Fällig · Bezeichnung · Menge · Einzelpreis · Netto"`

---

### shadcn Component Init Location
**Source:** RESEARCH.md L459–466 (Pitfall 3)
**Apply to:** All component scaffolding tasks

Run `npx shadcn@latest init -t vite --monorepo -y` from **`packages/ui/`** only. Never run it inside `apps/desktop`.

---

## No Analog Found

All 27 files have no existing codebase analog. Greenfield confirmed: no `apps/`, no `packages/`, no source files present (verified 2026-08-19).

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| All 27 files | various | various | Repo contains only `docs/` and `.planning/`; no prior code |

Planner uses RESEARCH.md code examples as the source of truth for all patterns.

---

## Critical Planner Notes

1. **Rust blocking:** Wave 0 task must install Rust via `rustup` before any `tauri dev`. No fallback.
2. **TaxDecision fields:** Use canonical names from `docs/clared-tax-engine-architecture.md` (not simplified RESEARCH.md names). Mapping table above.
3. **shadcn init location:** `packages/ui/` only (not `apps/desktop/`).
4. **No `tailwind.config.js`:** Tailwind v4 is CSS-first; shadcn v4 init generates `globals.css` with `@import "tailwindcss"`.
5. **HashRouter required:** BrowserRouter breaks on Tauri custom protocol in production builds.
6. **Higgsfield auth check:** Pre-condition before illustration generation task; use placeholder PNG if auth fails.
7. **Windows build:** macOS machine only; Windows verification requires GitHub Actions `windows-latest` runner.

---

## Metadata

**Analog search scope:** `/Users/puzzless/Desktop/claredtool/` (root + all subdirs)
**Files scanned:** docs/ (5 planning docs) — no source code files exist
**Pattern extraction date:** 2026-08-19
