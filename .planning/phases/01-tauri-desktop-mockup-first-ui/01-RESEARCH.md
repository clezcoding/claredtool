# Phase 01: Tauri Desktop & Mockup-First UI — Research

**Researched:** 2026-08-19
**Domain:** Tauri 2 desktop shell, React/TypeScript/Vite, shadcn/ui, pnpm monorepo, Higgsfield CLI
**Confidence:** MEDIUM

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Frontend is React/TypeScript
- D-02: Component layer is shadcn/ui + Radix (headless kit)
- D-03: Styling is Tailwind CSS
- D-04: Repo layout is `apps/desktop` + `packages/ui` — no `apps/backend` or `packages/tax-engine` this phase
- D-05: Left sidebar navigation (not top tabs, not command-palette-only)
- D-06: Sidebar order: Rechnung · Entities · Kunden · Tax · PDF
- D-07: Native OS titlebar — `decorations` stay ON
- D-08: Visual density: dense-but-calm
- D-09: Dark-first theme. No light theme in Phase 1.
- D-10: Clickable dark UI in Tauri window + UI-SPEC (not Figma-only)
- D-11: Clickable screens: 5 sidebar destinations + one invoice empty state
- D-12: One realistic B2B sample invoice (EU-GmbH seller + US customer)
- D-13: Sidebar navigation works; invoice form fields visible/editable (no persist); Tax/PDF are staged
- D-14: Invoice workspace: form left, live-tax rail right
- D-15: Live-tax rail on invoice screen shows staged TaxDecision fields (rate, reverse charge, legal text, applied_rule_id)
- D-16: PDF peek under tax rail; click opens full PDF sidebar screen (no modal)
- D-17: Line items are one compact card per line (not table, not Word-like block)
- D-18: Line-item card: Bezeichnung, Menge, Einzelpreis, Netto
- D-19: Card fields always visible (no accordion, no edit dialog)
- D-20: „+ Position" control at list bottom
- D-21: Delete via hover-X on card
- D-22: App launch lands on filled sample invoice
- D-23: „Neue Rechnung" toggles to empty state locally; another action returns to sample
- D-24: Empty state = large Higgsfield illustration + marketing copy
- D-25: Higgsfield CLI for all illustrative graphics (empty-state hero, marketing art); GPT Image 2 default
- D-26: Staged PDF is HTML/CSS (not Higgsfield); paper visual keeps numbers consistent
- D-27: Paper is a light page on a dark stage (frame + shadow)
- D-28: Full PDF sidebar: one centered page on dark stage; decorative zoom; no two-page spread
- D-29: Entities and Kunden: list + read-only fake detail on click
- D-30: Sample rows: exactly one entity (EU-GmbH) + one customer (US)
- D-31: „Anlegen" buttons visible, disabled, with "Wird in Phase 3 aktiviert" hint

### Claude's Discretion
- Exact Tailwind/shadcn token values and shadcn style (new-york vs default), as long as dark-first + dense-but-calm hold
- Default window size, sidebar icon set, Tax-rail / empty-state marketing copy
- Concrete sample invoice field values (EU-GmbH seller, US customer)
- Whether „+ Position" adds a visual card or is a visible no-op
- Decorative zoom on the PDF viewer

### Deferred Ideas (OUT OF SCOPE)
- Light theme
- Custom titlebar / `decorations: false`
- Vue, MUI/Ant, CSS-in-JS
- `apps/backend`, `packages/tax-engine` scaffolding
- Real tax engine, collision logic, multiple tax scenarios
- Real PDF generation / embedded PDF file (Phase 4)
- Authentik / Coolify / persist / offline (Phases 2–4)
- Owner-only entity create (Phase 3)
- Per-screen loading, error, offline states
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Every UI-bearing phase has interactive mockups / UI-SPEC before implementation | UI-SPEC already approved (01-UI-SPEC.md); implementation must deliver clickable dark UI in Tauri window matching the spec |
| DESK-01 | User can run Clared as a Tauri desktop app (Rust + Web-UI) on macOS and Windows | Tauri 2.11.4 CLI + create-tauri-app React/TS/Vite template; Rust install required first |
</phase_requirements>

---

## Summary

Phase 1 delivers: Rust installed → Tauri 2 project scaffolded in monorepo layout → React/TS/Vite frontend with shadcn/ui + Tailwind → five-screen dark clickable shell matching the approved UI-SPEC → one Higgsfield-generated empty-state illustration → HTML/CSS staged PDF paper mock.

**Critical blocker:** Rust/Cargo is **not installed** on the dev machine. Wave 0 must install Rust via `rustup` before any `tauri dev` or `tauri build` can run. Everything else (Node 26, pnpm 11, Xcode 26) is available.

**Primary recommendation:** Scaffold with `pnpm create tauri-app@latest` at repo root, selecting React/TypeScript/Vite. Then restructure into `apps/desktop/` + `packages/ui/` with `pnpm-workspace.yaml`. Init shadcn with `--template vite --monorepo` inside `packages/ui`. Build five hardcoded-data screens; generate one Higgsfield illustration for the empty state.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Desktop window / native shell | Tauri runtime (Rust) | — | Tauri owns OS window, titlebar, app lifecycle |
| Frontend UI rendering | Browser (Vite/React WebView) | — | All HTML/CSS/JS rendered inside Tauri WebView |
| Sidebar navigation & routing | Frontend (React Router) | — | SPA routing inside WebView; no server involved |
| Shared UI components | `packages/ui` package | `apps/desktop` consumer | Design system in separate package; desktop imports it |
| Invoice form / line-item mock | Frontend (React state) | — | Local React state only; no persist this phase |
| Live-tax rail (staged) | Frontend (hardcoded data) | — | No real evaluate(); hardcoded TaxDecision shape |
| PDF mock (paper) | Frontend (HTML/CSS) | — | HTML template from sample data; no PDF binary |
| Empty-state illustration | Higgsfield CLI (build-time) | `public/` asset | GPT Image 2 generates PNG; shipped as static asset |
| Cross-platform build | Tauri CLI + cargo | GitHub Actions (Windows) | macOS dev machine; Windows needs CI or VM |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tauri-apps/cli` | 2.11.4 | Tauri build/dev CLI | Official Tauri toolchain |
| `@tauri-apps/api` | 2.11.1 | JS bridge to Tauri backend | Official Tauri JS API |
| `react` | 19.2.8 | UI framework | D-01 locked |
| `react-dom` | 19.2.8 | React DOM renderer | Paired with react |
| `react-router` | 8.3.0 | SPA routing inside WebView | Standard React routing; v7+ unified package |
| `vite` | 8.2.1 | Frontend bundler / dev server | Tauri default; fast HMR |
| `@vitejs/plugin-react` | 6.0.5 | React JSX transform for Vite | Official Vite React plugin |
| `typescript` | 7.0.2 | Type safety | D-01 locked |
| `tailwindcss` | 4.3.3 | Utility-first CSS | D-03 locked |
| `shadcn` (CLI) | 4.18.0 | Component scaffolding CLI | D-02 locked; installs Radix primitives per component |
| `lucide-react` | 1.33.0 | Icons | shadcn default icon library |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tailwindcss/vite` | latest | Tailwind v4 Vite plugin | Required for Tailwind v4 with Vite |
| `tw-animate-css` | latest | CSS animations for shadcn | Pulled in by shadcn init |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-router` HashRouter | TanStack Router | TanStack is zero-dep, file-based; react-router is more familiar and Context7 docs are richer |
| `shadcn` (copy-paste model) | full component library (MUI) | D-02 locked; shadcn avoids bundle bloat and allows token customization |
| pnpm workspaces | Turborepo | Turborepo adds caching but is overkill for 2-package monorepo; pnpm workspaces alone sufficient |

**Installation (root):**

```bash
# 0. Install Rust (BLOCKING - not installed)
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
source "$HOME/.cargo/env"

# 1. Scaffold Tauri app (run at repo root, then restructure)
pnpm create tauri-app@latest apps/desktop -- --template react-ts

# 2. Init pnpm workspace
# (create pnpm-workspace.yaml at root, see Architecture Patterns)

# 3. Init shadcn in packages/ui
cd packages/ui
npx shadcn@latest init -t vite --monorepo -y
```

**Version verification (all verified against npm registry 2026-08-19):**

```bash
npm view @tauri-apps/cli version   # 2.11.4 ✓
npm view @tauri-apps/api version   # 2.11.1 ✓
npm view react version             # 19.2.8 ✓
npm view react-router version      # 8.3.0 ✓
npm view vite version              # 8.2.1 ✓
npm view tailwindcss version       # 4.3.3 ✓
npm view shadcn version            # 4.18.0 ✓
npm view lucide-react version      # 1.33.0 ✓
npm view typescript version        # 7.0.2 ✓
```

---

## Package Legitimacy Audit

> Run per Package Legitimacy Gate protocol — 2026-08-19.

| Package | Registry | Age | Downloads/wk | Source Repo | Verdict | Disposition |
|---------|----------|-----|--------------|-------------|---------|-------------|
| `@tauri-apps/cli` | npm | ~6 yrs | 1.78M | github.com/tauri-apps/tauri | OK | Approved |
| `@tauri-apps/api` | npm | ~6 yrs | 1.99M | github.com/tauri-apps/tauri | OK | Approved |
| `react` | npm | ~12 yrs | 143.7M | github.com/react/react | SUS (too-new latest) | Approved — false positive; latest version published 2026-07-21; package is canonical React |
| `react-dom` | npm | ~12 yrs | 135.5M | github.com/react/react | SUS (too-new latest) | Approved — same as react |
| `react-router` | npm | ~10 yrs | 43.5M | github.com/remix-run/react-router | SUS (too-new latest) | Approved — false positive; canonical Remix routing library |
| `vite` | npm | ~6 yrs | 142.8M | github.com/vitejs/vite | SUS (too-new latest) | Approved — false positive; canonical Vite bundler |
| `@vitejs/plugin-react` | npm | ~5 yrs | 71.1M | github.com/vitejs/vite-plugin-react | SUS (too-new latest) | Approved — false positive; official Vite React plugin |
| `tailwindcss` | npm | ~8 yrs | 105.9M | github.com/tailwindlabs/tailwindcss | OK | Approved |
| `lucide-react` | npm | ~5 yrs | 81.5M | github.com/lucide-icons/lucide | SUS (too-new latest) | Approved — false positive; published 2026-08-19; canonical Lucide icons |
| `typescript` | npm | ~12 yrs | 180.4M | github.com/microsoft/TypeScript | OK | Approved |
| `shadcn` (CLI) | npm | ~3 yrs | N/A (CLI) | github.com/shadcn-ui/ui | OK | Approved |

**Packages removed due to SLOP verdict:** none

**Packages flagged as SUS:** react, react-dom, react-router, vite, @vitejs/plugin-react, lucide-react — all flagged `too-new` because their latest version was published recently. All are canonical, high-download packages from authoritative organizations. No human-verify checkpoint needed; these are industry-standard packages.

*All packages verified against npm registry (`npm view <pkg> version`) on 2026-08-19.*

---

## Architecture Patterns

### System Architecture Diagram

```
User OS (macOS / Windows)
  └─ Tauri Runtime (Rust)
       ├─ Native Window (decorations ON, D-07)
       │    └─ WebView
       │         └─ React SPA (Vite bundle)
       │              ├─ HashRouter
       │              │    ├─ /  → Rechnung screen (sample invoice, D-22)
       │              │    │      ├─ Left panel: form + line-item cards (D-14, D-17)
       │              │    │      ├─ Right rail: staged TaxDecision (D-15)
       │              │    │      └─ PDF peek → link to /pdf (D-16)
       │              │    ├─ /entities → Entities list + read-only detail (D-29)
       │              │    ├─ /kunden   → Kunden list + read-only detail (D-29)
       │              │    ├─ /tax      → Tax staged screen
       │              │    └─ /pdf      → Full PDF sidebar (D-28)
       │              ├─ Left Sidebar (D-05, D-06)
       │              └─ packages/ui components (shadcn/Radix/Tailwind)
       └─ src-tauri/
            ├─ Cargo.toml
            ├─ tauri.conf.json
            └─ src/lib.rs (minimal; no commands this phase)
```

Data flow: hardcoded sample invoice JSON → React state → rendered components. No IPC, no network, no Tauri commands.

### Recommended Project Structure

```
claredtool/                    # repo root (was .planning only, now also code)
├── pnpm-workspace.yaml        # workspaces: [apps/*, packages/*]
├── package.json               # root devDependencies (TS, lint shared config)
├── apps/
│   └── desktop/               # Tauri app
│       ├── src-tauri/
│       │   ├── Cargo.toml
│       │   ├── tauri.conf.json
│       │   └── src/
│       │       └── lib.rs
│       ├── src/               # React frontend
│       │   ├── main.tsx
│       │   ├── App.tsx        # HashRouter + Sidebar + Outlet
│       │   ├── routes/
│       │   │   ├── rechnung.tsx
│       │   │   ├── entities.tsx
│       │   │   ├── kunden.tsx
│       │   │   ├── tax.tsx
│       │   │   └── pdf.tsx
│       │   ├── data/
│       │   │   └── sample-invoice.ts   # hardcoded B2B invoice (D-12)
│       │   └── styles/
│       │       └── globals.css
│       ├── public/
│       │   └── empty-state-hero.png   # Higgsfield generated (D-25)
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
└── packages/
    └── ui/                    # shadcn design system
        ├── src/
        │   ├── components/ui/ # shadcn components
        │   └── index.ts       # barrel export
        ├── components.json
        ├── package.json
        └── tsconfig.json
```

### Pattern 1: pnpm-workspace.yaml (monorepo root)

```yaml
# Source: pnpm docs + web search [ASSUMED]
packages:
  - 'apps/*'
  - 'packages/*'
```

### Pattern 2: tauri.conf.json (v2 format)

```json
// Source: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/start/frontend/vite.mdx [CITED]
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
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "icon": ["icons/32x32.png", "icons/128x128.png"]
  }
}
```

**Note:** Tauri v2 uses `app.windows[]` (not `tauri.windows[]` from v1). Config schema changed between v1 and v2.

### Pattern 3: HashRouter routing (Tauri-safe)

```tsx
// Source: https://github.com/remix-run/react-router/blob/main/docs/api/data-routers/createHashRouter.md [CITED]
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

**Why HashRouter over BrowserRouter:** Tauri v2 serves from `tauri://localhost` (macOS) or `https://tauri.localhost` (Windows). HashRouter avoids any ambiguity with the custom protocol when navigating directly to a sub-route.

### Pattern 4: shadcn dark mode init (Vite + monorepo)

```bash
# Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/cli.mdx [CITED]
# Run inside packages/ui
npx shadcn@latest init -t vite --monorepo -y
```

Then in `packages/ui/src/styles/globals.css`:

```css
/* Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/manual.mdx [CITED] */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
```

Apply dark mode by setting `class="dark"` on `<html>` at startup (D-09 dark-first):

```tsx
// Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/vite.mdx [CITED]
// In main.tsx or index.html, add class="dark" to <html>
document.documentElement.classList.add("dark");
```

### Pattern 5: Cross-package import (packages/ui → apps/desktop)

```json
// apps/desktop/package.json
{
  "dependencies": {
    "@clared/ui": "workspace:*"
  }
}
```

```typescript
// apps/desktop/src/routes/rechnung.tsx
import { Button, Card } from "@clared/ui";
```

```json
// packages/ui/package.json
{
  "name": "@clared/ui",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Vite resolves `workspace:*` links via pnpm symlinks without extra Vite alias config.

### Pattern 6: Higgsfield empty-state illustration

```bash
# Source: /Users/puzzless/.claude/skills/higgsfield-generate/SKILL.md (read this session)
# GPT Image 2 for UI illustration (D-25)
higgsfield generate create gpt_image_2 \
  --prompt "Minimalist dark UI illustration: a crisp B2B invoice document floating on a deep navy background. Clean geometric shapes, subtle glow. Professional, calm, dense. No people. No text." \
  --wait
# Download the returned URL → save to apps/desktop/public/empty-state-hero.png
```

### Anti-Patterns to Avoid

- **Running `tauri dev` without Rust installed:** Will fail immediately. Install Rust first (Wave 0).
- **Using `tauri.windows[]` (v1 config key) in v2:** v2 uses `app.windows[]`. The scaffolded template generates correct v2 format.
- **Using `BrowserRouter` with `devUrl`:** Works in dev but may fail in production build where Tauri serves `tauri://localhost/` — sub-routes without a server 404. Use `createHashRouter`.
- **Installing shadcn in `apps/desktop` directly:** D-04 mandates `packages/ui` holds the design system. Install and export from `packages/ui`, import in `apps/desktop`.
- **Using `localStorage` for dark mode persistence in Tauri:** Use hardcoded `classList.add("dark")` since Phase 1 has no persist and is dark-first.
- **Scaffolding `apps/backend` or `packages/tax-engine`:** Explicitly deferred (D-04). Do not create these.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UI components (Button, Card, Input) | Custom component library | `shadcn/ui` (Radix + Tailwind) | D-02; accessibility + dark mode tokens baked in |
| Icon set | Custom SVG icons | `lucide-react` | shadcn default; 1000+ icons, tree-shakeable |
| Routing | Custom history management | `react-router` HashRouter | Hash-safe for Tauri custom protocol |
| Dark mode class management | Custom theme toggle logic | `document.documentElement.classList.add("dark")` at boot | Phase 1 is dark-only; no toggle needed |
| PDF preview | Embedded PDF renderer (PDF.js) | HTML/CSS paper mock | D-26: staged PDF is HTML/CSS from sample data |
| Empty-state art | Custom SVG illustration | `higgsfield generate` GPT Image 2 | D-25 |
| Monorepo task runner | Custom Makefile / scripts | pnpm workspace scripts | pnpm `--filter` handles cross-package commands |

**Key insight:** The entire Phase 1 UI is hardcoded static data — no API client, no Tauri commands, no IPC. The only external process is the Higgsfield CLI for the illustration asset.

---

## Common Pitfalls

### Pitfall 1: Rust Not Installed (Blocking)

**What goes wrong:** `tauri dev` fails with `error: rustc is not found`. The entire Tauri build pipeline is Rust-based.

**Why it happens:** Rust is not a standard macOS system tool. Not installed on this machine (verified 2026-08-19).

**How to avoid:** Wave 0 task installs Rust via `rustup` before any other Tauri work. After install, open a new shell or `source ~/.cargo/env`.

**Warning signs:** `command not found: rustc` / `command not found: cargo`.

---

### Pitfall 2: Tauri v1 vs v2 Config Format

**What goes wrong:** Using v1 config keys (`tauri.windows[]`, `tauri.bundle`) in a v2 project causes silent failures or CLI errors.

**Why it happens:** Tauri 2 restructured `tauri.conf.json`. v1 used top-level `tauri` key; v2 uses top-level `app`, `bundle`, `build`.

**How to avoid:** Use `pnpm create tauri-app@latest` which generates v2 config automatically. Do not copy v1 examples from older blog posts.

**Warning signs:** `tauri dev` warning about unknown config keys.

---

### Pitfall 3: shadcn Init in Wrong Directory

**What goes wrong:** Running `npx shadcn@latest init` inside `apps/desktop` creates a second component library there, violating D-04.

**Why it happens:** The default init path is cwd.

**How to avoid:** Run `npx shadcn@latest init -t vite --monorepo -y` from `packages/ui/`. Import components via `@clared/ui` in `apps/desktop`.

---

### Pitfall 4: Windows Build Without Windows Machine

**What goes wrong:** `pnpm tauri build` on macOS produces only a `.dmg` and `.app`. No Windows `.exe` or `.msi`.

**Why it happens:** Tauri cross-compilation from macOS to Windows requires either a Windows machine or GitHub Actions with `windows-latest` runner.

**How to avoid:** macOS dev machine verifies macOS launch. Windows build tested in CI or on a Windows machine. DESK-01 requires both platforms — plan must include a Windows verification step.

**Warning signs:** `tauri build` produces only `target/release/bundle/macos/`. No `.exe` in output.

---

### Pitfall 5: pnpm workspace:* Resolution in Vite

**What goes wrong:** `@clared/ui` import fails in Vite dev with "Cannot find module" if `packages/ui` has no build step or wrong `exports` in `package.json`.

**Why it happens:** pnpm links the package via symlink; Vite resolves the `exports` field. If `exports` points to a built file that doesn't exist, import fails.

**How to avoid:** Point `packages/ui` `exports` at `./src/index.ts` (TypeScript source). Vite handles transpilation at dev time. Only add a build step if publishing to npm.

---

### Pitfall 6: Tailwind v4 Import Syntax

**What goes wrong:** Using `tailwind.config.js` or old `@layer` directive syntax from Tailwind v3 with a Tailwind v4 install. shadcn v4 generates v4 CSS.

**Why it happens:** Tailwind v4 uses `@import "tailwindcss"` and CSS `@theme`, not `tailwind.config.js`.

**How to avoid:** Follow shadcn v4 init output. Do not add a `tailwind.config.js` file. Let shadcn generate `globals.css` with `@import "tailwindcss"`.

---

## Code Examples

### Sidebar layout with Outlet

```tsx
// Source: shadcn sidebar pattern + react-router Outlet [ASSUMED pattern, standard idiom]
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

### Staged TaxDecision shape (UI-SPEC aligned, D-15)

```typescript
// Source: docs/clared-tax-engine-architecture.md (read canonical_refs) [ASSUMED — not read this session]
// Planner must verify field names against docs/clared-tax-engine-architecture.md
interface StagedTaxDecision {
  rate: number;           // e.g. 0.19
  reverse_charge: boolean;
  legal_text: string;     // e.g. "§13b UStG"
  applied_rule_id: string; // e.g. "eu-b2b-reverse-charge"
}

const SAMPLE_TAX_DECISION: StagedTaxDecision = {
  rate: 0,
  reverse_charge: true,
  legal_text: "Steuerschuldnerschaft des Leistungsempfängers (§13b UStG)",
  applied_rule_id: "eu-b2b-reverse-charge",
};
```

### Line-item card component

```tsx
// Source: UI-SPEC D-17, D-18, D-19, D-21 [ASSUMED pattern]
import { X } from "lucide-react";

interface LineItem {
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  netto: number;
}

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

---

## Runtime State Inventory

SKIPPED — greenfield phase. No existing running services, stored data, OS registrations, or build artifacts to inventory.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 (`tailwind.config.js`) | Tailwind v4 (`@import "tailwindcss"` in CSS) | Tailwind v4.0 (2024) | No config file; CSS-first config via `@theme` |
| shadcn v1/v2 (`shadcn-ui` package) | shadcn v4 (`shadcn` package, new-york/base styles) | 2024–2025 | CLI is `npx shadcn@latest`; `shadcn-ui` deprecated |
| Tauri 1.x (`tauri.windows[]` top-level) | Tauri 2.x (`app.windows[]`) | Tauri 2.0 (Oct 2024) | Config restructured; v1 examples are wrong |
| `react-router-dom` v6 | `react-router` v7/8 (unified package) | React Router v7 (2024) | Single package; no separate `react-router-dom` |

**Deprecated/outdated:**

- `react-router-dom`: replaced by `react-router` (unified). Do not install `react-router-dom`.
- `shadcn-ui` (npm package name): deprecated. Use `shadcn`.
- `tailwind.config.js`: not used in Tailwind v4. shadcn v4 init does not create one.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | StagedTaxDecision field names (rate, reverse_charge, legal_text, applied_rule_id) | Code Examples | Wrong field names in mock data; planner must verify against `docs/clared-tax-engine-architecture.md` |
| A2 | Sidebar layout component structure (AppShell + Outlet pattern) | Code Examples | Cosmetic — easy to refactor |
| A3 | `apps/desktop` Vite dev server runs on port 5173 (Tauri default) | Architecture Patterns | If port differs, `tauri.conf.json` devUrl must match |
| A4 | `packages/ui` exports TypeScript source directly (no build step) | Architecture Patterns | If types fail to resolve, add `vite-tsconfig-paths` or a build step |
| A5 | Windows build requires CI (not cross-compiled from macOS) | Common Pitfalls | Could attempt cross-compile but it's complex; CI is the safe path |

---

## Open Questions

1. **TaxDecision field names**
   - What we know: CONTEXT.md says fields are `rate, reverse charge, legal text, applied_rule_id` (D-15)
   - What's unclear: Exact TypeScript field names in `docs/clared-tax-engine-architecture.md` (camelCase vs snake_case?)
   - Recommendation: Planner reads `docs/clared-tax-engine-architecture.md` before writing the sample data shape; use whatever names appear in the spec.

2. **Windows build verification**
   - What we know: DESK-01 requires macOS AND Windows; dev machine is macOS only
   - What's unclear: Is a Windows CI job (GitHub Actions `windows-latest`) in scope for this phase, or is it documented as a manual-verify step?
   - Recommendation: Plan includes a "Windows launch verified" success gate; if no Windows machine, add a GH Actions workflow as a task.

3. **Higgsfield auth state**
   - What we know: Higgsfield CLI is installed at `/opt/homebrew/bin/higgsfield`
   - What's unclear: Whether the current session is authenticated (`higgsfield account status`)
   - Recommendation: Planner adds a `higgsfield auth login` check as a Wave 0 prerequisite before the illustration generation task.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite / npm / create-tauri-app | ✓ | 26.7.0 | — |
| pnpm | Monorepo / Tauri CLI | ✓ | 11.15.1 | npm (slower) |
| Rust / Cargo | Tauri core | **✗** | — | **NONE — blocking** |
| Xcode / xcrun | macOS bundle signing | ✓ | 26.6 | — |
| @tauri-apps/cli (npm) | `pnpm tauri dev/build` | ✓ (npx) | 2.11.4 | — |
| Higgsfield CLI | Empty-state illustration (D-25) | ✓ | at `/opt/homebrew/bin/higgsfield` | Placeholder PNG in public/ (unblock UI work) |
| Windows machine / CI | DESK-01 Windows launch | **✗** | — | GitHub Actions `windows-latest` runner |

**Missing dependencies with no fallback:**

- **Rust / Cargo:** Cannot run `tauri dev` or `tauri build` without it. Wave 0 must install via `rustup`.

**Missing dependencies with fallback:**

- **Windows machine:** Use GitHub Actions `windows-latest` runner. Plan must include a CI verification task for Windows.
- **Higgsfield auth:** If unauthenticated, use a placeholder PNG while auth is resolved (unblocks all UI layout work).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None yet — greenfield. Recommend Vitest (Vite-native) |
| Config file | `vitest.config.ts` — Wave 0 gap |
| Quick run command | `pnpm vitest run --reporter=verbose` |
| Full suite command | `pnpm vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DESK-01 | Tauri window launches on macOS | smoke (manual) | `pnpm tauri dev` → visual confirm | ❌ Wave 0 |
| DESK-01 | Tauri window launches on Windows | smoke (CI) | GitHub Actions build + launch check | ❌ Wave 0 |
| UI-01 | 5 sidebar routes are navigable | smoke (Vitest + RTL) | `pnpm vitest run --reporter=verbose` | ❌ Wave 0 |
| UI-01 | Sample invoice renders (seller EU-GmbH, buyer US) | unit | `pnpm vitest run` | ❌ Wave 0 |
| UI-01 | Empty state renders on „Neue Rechnung" | unit | `pnpm vitest run` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm vitest run --reporter=dot` (fast unit check)
- **Per wave merge:** `pnpm vitest run` (full suite)
- **Phase gate:** Full suite green + macOS visual launch confirmed before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `apps/desktop/vitest.config.ts` — configure Vitest with jsdom environment
- [ ] `apps/desktop/src/__tests__/routes.test.tsx` — covers UI-01 route navigation
- [ ] `apps/desktop/src/__tests__/invoice.test.tsx` — covers UI-01 sample invoice render
- [ ] Install `vitest`, `@testing-library/react`, `jsdom` in `apps/desktop`

---

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1` from config.

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in Phase 1 (Phase 2) |
| V3 Session Management | No | No sessions in Phase 1 |
| V4 Access Control | No | No RBAC in Phase 1 |
| V5 Input Validation | Minimal | Mock form fields; no persist means no injection risk. Validate number inputs client-side for UX only. |
| V6 Cryptography | No | No secrets, keys, or crypto in Phase 1 |
| Tauri CSP | Yes | `security.csp: null` is permissive for dev; tighten before Phase 2. Acceptable for Phase 1 mockup-only local app. |

### Known Threat Patterns (Phase 1 scope)

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Tauri IPC injection (malicious JS → backend command) | Tampering | No Tauri commands defined in Phase 1 — attack surface is zero |
| CSP bypass via inline scripts | Tampering | shadcn/Tailwind generate CSS, not inline `<script>`. Keep default Tauri CSP. |
| Local file read via WebView | Info Disclosure | No filesystem access used in Phase 1; default Tauri allowlist is `deny-all` |

**Security posture for Phase 1:** Acceptable. Pure local mockup with no network, no IPC commands, no user data. Tighten CSP and add allowlist control in Phase 2 when API calls begin.

---

## Sources

### Primary (MEDIUM confidence — Context7 verified)

- `/tauri-apps/tauri-docs` (Context7) — create-tauri-app scaffolding, prerequisites, tauri.conf.json v2, decorations, cross-platform build targets
- `/shadcn-ui/ui` (Context7) — Vite install, init CLI, dark mode ThemeProvider, components.json schema, Tailwind v4 CSS config
- `/remix-run/react-router` (Context7) — createHashRouter, BrowserRouter, NavLink, Outlet, SPA setup

### Secondary (MEDIUM confidence — npm registry verified)

- npm registry `npm view <pkg> version` — all package versions verified 2026-08-19
- `/opt/homebrew/bin/higgsfield --help` — CLI availability and command surface confirmed live

### Tertiary (LOW confidence — web search)

- WebSearch: pnpm workspace monorepo + Tauri 2 + packages/ui pattern (GitHub: firxworx/vite-shadcn-workspace reference repo)

---

## Metadata

**Confidence breakdown:**

- Standard stack: MEDIUM — all versions verified via `npm view`; all packages from official orgs
- Architecture (Tauri 2 config format): MEDIUM — confirmed via Context7 official Tauri docs
- Monorepo layout: MEDIUM — confirmed pattern via Context7 shadcn + web search; `packages/ui` export pattern is LOW (assumed TypeScript-source export works without build step)
- Pitfalls: MEDIUM — Rust-not-installed confirmed live; v1/v2 config pitfall from Context7 docs
- Higgsfield: HIGH (locally verified binary present)
- Windows build: LOW (assumed CI path; no Windows machine to verify)

**Research date:** 2026-08-19
**Valid until:** 2026-09-19 (Tauri and shadcn move fast; re-verify versions before executing if >30 days)
