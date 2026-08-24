# Phase 4: Premium UI & Brand Redesign - Pattern Map

**Mapped:** 2026-08-23
**Files analyzed:** 20 (2 config/token, 2 boot/menu, 3 auth, 5 routes, 8 components) + 4 static PNG assets
**Analogs found:** 18 in-repo / 20 (2 net-new have no analog — Tauri menu + theme lib; RESEARCH.md supplies their pattern)

> **Restyle/rebrand phase.** Nothing new is built architecturally — existing `.tsx` files get re-skinned to `mockups/approved/` 1:1 using rewritten tokens. Therefore most "analogs" are **sibling files that already carry the shipping conventions** (Card/CardContent, `text-muted-foreground`, `min-h-11`, focus-ring class, DE-primary copy). The token rewrite in `packages/ui/src/styles/globals.css` is Wave 1 and flows to every screen; per-route restyle is Wave 2 and copies structure from the analogs below. Do NOT change IA, add nav items, or tokenize `PdfPaper` content (D-09/D-11).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/ui/src/styles/globals.css` | config (tokens) | transform | itself (in-place split of `:root,.dark`) | self |
| `apps/desktop/src/main.tsx` | config (boot) | event-driven | itself + Pattern 2 (RESEARCH) | self / research |
| `apps/desktop/src/lib/theme.ts` *(new)* | utility | event-driven | `components/spinner.tsx` (matchMedia idiom) | role-match |
| `apps/desktop/src/lib/theme.test.ts` *(new)* | test | — | none (no `*.test.ts` found in `src/`) | no-analog |
| Darstellung menu (in `main.tsx` or `lib/theme-menu.ts` *new*) | provider (native menu) | event-driven | none in repo (no custom menu today) | no-analog → RESEARCH Pattern 3 |
| `apps/desktop/src/App.tsx` | component (shell) | request-response | itself (restyle chrome only) | self |
| `apps/desktop/src/auth/login-gate.tsx` | component | request-response | itself + new hero swap | self |
| `apps/desktop/src/auth/session-chip.tsx` | component | request-response | `components/session-chip.tsx` (same conventions) | exact |
| `apps/desktop/src/auth/session-banner.tsx` | component | request-response | `components/session-banner.tsx` | exact |
| `apps/desktop/src/routes/rechnung.tsx` | route | CRUD (autosave) | itself; canvas/list patterns are SSOT for others | self |
| `apps/desktop/src/routes/entities.tsx` | route | CRUD | itself (list+panel SSOT) | self |
| `apps/desktop/src/routes/kunden.tsx` | route | CRUD | `routes/entities.tsx` (shares mockup, list+panel) | exact |
| `apps/desktop/src/routes/tax.tsx` | route | read (subscribe) | `components/tax-rail.tsx` (same `dl` field list) | role-match |
| `apps/desktop/src/routes/pdf.tsx` | route | read | itself; stage tokens, paper stays inline | self |
| `apps/desktop/src/components/invoice-empty-state.tsx` | component | read | itself + `empty-invoices.png` swap | self |
| `apps/desktop/src/components/tax-rail.tsx` | component | read | itself; money → tabular-nums | self |
| `apps/desktop/src/components/pdf-paper.tsx` | component | read | itself — **keep inline `#fff/#111`** (D-09) | self / do-not-touch-colors |
| `apps/desktop/src/components/line-item-card.tsx` | component | transform | itself; `netto`/money → `.tabular-nums` (D-03) | self |
| `apps/desktop/src/components/skeleton.tsx` | component | — | itself (`animate-pulse bg-muted`) | self |
| `apps/desktop/src/components/error-state.tsx` | component | read | itself; splash/error derive from tokens (D-12) | self |
| `apps/desktop/src/components/spinner.tsx` | component | — | itself (reduced-motion gate is the reuse SSOT) | self |
| `apps/desktop/public/{login-gate-hero,empty-state-hero,empty-entities,splash}.png` | asset | file-I/O | old navy PNGs → Crafted PNGs | asset-swap |

## Shared Patterns

These conventions already exist across the shipping app. **Every restyled file must preserve them** — the rebrand changes token *values*, not these structural idioms.

### Token consumption (semantic classes, never raw hex)
**Source:** `App.tsx:39-51`, everywhere.
**Apply to:** all `.tsx`. Screens read `bg-background text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `bg-accent text-accent-foreground`, `border-border`, `bg-primary text-primary-foreground`, `text-destructive`. After the `globals.css` split these classes auto-swap Light/Dark — **do not** hard-code colors in components.
```tsx
// App.tsx:39-51 — sidebar active/idle uses accent + muted-foreground tokens
<div className="flex h-screen bg-background text-foreground">
  <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-border p-2">
    <NavLink className={({ isActive }) =>
      `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
        isActive ? "bg-accent text-accent-foreground"
                 : "text-muted-foreground hover:text-foreground"}`}>
```

### Focus ring (accessibility — never cut, D-not-lazy)
**Source:** `auth/login-gate.tsx:7-8`, `components/session-banner.tsx:4-5`, `components/session-chip.tsx:28-29`.
**Apply to:** every interactive CTA/chip.
```tsx
const CTA_CLASS =
  "min-h-11 self-start font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
```

### Card container
**Source:** `routes/entities.tsx:200-201,314-315`, `components/error-state.tsx:6-7`, `session-banner.tsx:20-21`.
**Apply to:** detail panels, error/banner surfaces. `<Card><CardContent className="… pt-6 …">` from `@clared/ui`.

### Loading = skeleton matching layout (D-18), not spinner
**Source:** `routes/rechnung.tsx:456-471` (canvas skeleton), `routes/entities.tsx:170-173`, `components/skeleton.tsx`.
**Apply to:** all in-app loads. Spinner only inline in buttons / autosave chip / splash.
```tsx
// skeleton.tsx — the only skeleton primitive; compose <Skeleton className="h-N w-…" />
<div className={`animate-pulse rounded-md bg-muted ${className}`} />
```

### Reduced-motion gate (D-17 — motion axis is OS-only, independent of Darstellung)
**Source:** `components/spinner.tsx:2-10`. This is the reuse SSOT for both `lib/theme.ts` matchMedia and any JS motion check.
```tsx
const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
// className: `…${reduceMotion ? "" : " animate-spin"}`
```

### Money / tabular numerals (D-03 — new this phase)
**Apply to:** `line-item-card.tsx:81,104` (`einzelpreis`/`netto` `.toFixed(2)`), `tax-rail.tsx` rate value, `pdf-paper.tsx:53-54,61-62` (paper stays inline-colored but numerals may still use tabular-nums). Add `font-variant-numeric: tabular-nums` via a `.tabular-nums`/`.money` utility from `globals.css`, not a second font family.

### DE-primary copy (D-15)
**Source:** all files — German strings inline (`"Entity anlegen"`, `"Erneut versuchen"`, `"Wird geladen"`). Keep DE primary; add EN counterparts only where UI-SPEC requires (shell/gate/empty/errors).

## Pattern Assignments

### `packages/ui/src/styles/globals.css` (config/tokens, transform) — **Wave 1, blocks everything**

**Analog:** itself. **Reuse the `@theme inline` alias block verbatim** (`:10-33`); only the raw values and font change.

**Keep as-is** (`:1-5,10-33`): `@import "tailwindcss"`, `@custom-variant dark (&:is(.dark *))`, the full `--color-* → var(--*)` alias map, `--radius-sm/md/lg: 4/8/12px`.

**Rewrite `--font-sans`** (`:11`) — drop Inter (D-03):
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
```

**Split the shared block** — current forced-dark navy at `:35-56` is `:root, .dark { … }`. Break into a Light `:root` (White/Oatmeal/Charcoal/Stone/Sage, D-02) and a Dark `.dark` (Charcoal; HSL sampled from `03-rechnung-dark.png`/`05-entities-dark.png`, A2). Replace the blue `--primary`/`--accent: hsl(217 91% 60%)` (`:43,49`) with Sage `#A8BFA3`; `--destructive` becomes sparse Amber (A1), not red.

**Body font-family** (`:63-69`) currently hard-codes `Inter` — change to `var(--font-sans)`; add `.tabular-nums { font-variant-numeric: tabular-nums; }` and the motion tokens/`@media (prefers-reduced-motion: reduce)` block (RESEARCH Pattern 4).

---

### `apps/desktop/src/main.tsx` (config/boot, event-driven) — **Wave 1**

**Analog:** itself + RESEARCH Pattern 2. Current `:6` unconditionally forces dark:
```tsx
document.documentElement.classList.add("dark");   // main.tsx:6 — REPLACE
```
Replace with `applyTheme(currentPref())` from new `lib/theme.ts` **before** `ReactDOM.createRoot().render` (`:8`) to keep the pre-paint ordering (avoids FOUC, Pitfall 1). Add the `matchMedia('(prefers-color-scheme: dark)')` `change` listener that re-resolves only when pref==="system".

---

### `apps/desktop/src/lib/theme.ts` (utility, event-driven) — **new, Wave 1**

**Analog:** none for the whole file; closest idiom is `spinner.tsx:2-4` matchMedia usage. Implement `THEME_KEY`, `ThemePref`, `resolveDark`, `applyTheme`, `currentPref` exactly per RESEARCH Pattern 2 (~15 lines). Guard the localStorage read (`?? "system"`) — non-secret enum, no privilege (Security §).

**Test:** `lib/theme.test.ts` (new, no analog — first test in `src/`). Vitest + jsdom, mock `matchMedia`/`localStorage`; cover BRAND-01 (apply toggles `.dark`, resolveDark follows system, pref persists). Confirm a vitest jsdom config exists first (Wave 0 gap).

---

### Darstellung native menu (provider, event-driven) — **new, Wave 1, no in-repo analog**

**Analog:** none — app sets no custom menu today. Use RESEARCH Pattern 3 verbatim: `@tauri-apps/api/menu` `Submenu` of three `CheckMenuItem` (Hell/Dunkel/System), `action` calls `applyTheme(id)` + re-syncs checks, `setAsAppMenu()`. Build once after `applyTheme` (main window only). If a `core:menu` ACL error appears at runtime, add `core:menu:default` to `src-tauri/capabilities/default.json` (Pitfall 3).

---

### `apps/desktop/src/routes/entities.tsx` (route, CRUD) — list+panel SSOT

**Analog:** itself; it is the **canonical list+panel** other CRUD screens copy. Restyle to `04-entities-*.png`, keep behavior.

**Imports** (`:1-13`): named from `@clared/ui` (`Button, Card, CardContent, Combobox…, Input, Label`).

**Shared combobox trigger token** (`:49-50`) — reused in `rechnung.tsx:85-86` too:
```tsx
const comboboxTriggerClass =
  "min-h-11 w-full bg-card text-foreground font-normal hover:bg-muted";
```
**List rows** (`:180-196`): `<button>` with `border border-border … hover:bg-muted`, selected → `bg-muted`, `aria-current`. Apply "whisper separator / floating sidebar" feel (specifics) via the new border token, not a heavy rail.
**Loading/empty/error branches** (`:167-197`): Skeleton → empty copy → ErrorState — preserve this three-way.
**Detail/create panel** (`:200-340`): `<Card className="max-w-xl">`, `flex flex-col gap-1` field groups, submit `min-h-11 self-start font-semibold` with inline `<Spinner/>`, field error `text-xs text-destructive`.

---

### `apps/desktop/src/routes/kunden.tsx` (route, CRUD)

**Analog:** `routes/entities.tsx` (exact — shares the Entities mockups per D-12, same list+panel + Combobox + Card). Copy its restyle 1:1; do not diverge structurally.

---

### `apps/desktop/src/routes/rechnung.tsx` (route, CRUD/autosave) — split-canvas SSOT

**Analog:** itself. Split canvas + tax rail is the SSOT for the invoice surface. Restyle to `02/03-rechnung-*.png`.
- Autosave chip (`:519-535`): `text-sm text-muted-foreground` + inline `<Spinner/>` + "Speichert…/Gespeichert/…fehlgeschlagen" — keep.
- Field grid (`:563-676`): `<Card><CardContent className="grid gap-4 pt-6 text-sm sm:grid-cols-2">`; Select triggers use `min-h-11 w-full bg-card font-normal text-foreground hover:bg-muted` (`:610-613` etc).
- "+ Position" button (`:701-710`): `bg-primary … text-primary-foreground` — after rebrand primary is Sage; add `:active` `scale(0.97)` press feel (D-17).
- `showHero` empty gate (`:561`) and `showRail` (`:481,714-730`) — preserve behavior.

---

### `apps/desktop/src/routes/tax.tsx` (route, read)

**Analog:** `components/tax-rail.tsx` (same `dl`/`dt`/`dd` field-list pattern, `text-muted-foreground` keys). `tax.tsx:28-45` already mirrors it — restyle both together; money-ish values get `.tabular-nums`.

---

### `apps/desktop/src/routes/pdf.tsx` + `components/pdf-paper.tsx` (route/component, read) — **D-09 guard**

**Analog:** itself. `pdf.tsx:5` stage uses `bg-background` → follows theme (good). **`pdf-paper.tsx:10-16` keeps inline `background:#fff; color:#111`** — DO NOT tokenize (Pitfall 4/D-09). The `tax-rail.tsx:65-68` mini-preview also hard-codes `#fff` on purpose — leave it.

---

### `apps/desktop/src/auth/login-gate.tsx` (component, request-response) — hero swap

**Analog:** itself. Restyle to `08-login.png` (bilingual). Hero `<img src="/login-gate-hero.png">` (`:31-35`) — swap the file (new Crafted GPT Image 2 hero), keep markup + `alt=""`. Wordmark `<h1>Clared</h1>` stays system-font (`:36`, D-04). Reuse `CTA_CLASS` (`:7-8`).

---

### `auth/session-chip.tsx` + `auth/session-banner.tsx` (components)

**Analogs:** `components/session-chip.tsx` (exact) / `components/session-banner.tsx` (exact) — same conventions live in `components/`. Chip: `CHIP_CLASS` (`session-chip.tsx:28-29`) `bg-card … hover:bg-muted` + focus ring, `Badge variant="secondary"`, DropdownMenu identity+logout only — **add NO theme item** (D-07/Phase 2 D-36). Banner: `Card` + `text-destructive`(unauthorized)/`text-muted-foreground`(cancel).

---

### `apps/desktop/public/*.png` (assets, file-I/O)

**Analog:** old navy PNGs (asset-swap, not code). Copy `mockups/higgsfield/empty-invoices.png` → `public/empty-state-hero.png`; add `empty-entities.png`, `splash.png`; generate + drop new `login-gate-hero.png` (GPT Image 2, 7 credits). Leave an obvious `public/` drop-in path for ChatGPT-generated remainder (D-14). No runtime generation (D-25).

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/desktop/src/lib/theme.ts` | utility | event-driven | No theme lib exists (theme was hard-coded in `main.tsx:6`). Use RESEARCH Pattern 2; matchMedia idiom cribbed from `spinner.tsx:2-4`. |
| `apps/desktop/src/lib/theme.test.ts` | test | — | No `*.test.ts` under `src/`. First unit test; Wave 0 must confirm/add vitest jsdom config. |
| Darstellung menu (`main.tsx` / new `lib/theme-menu.ts`) | provider | event-driven | App sets no custom Tauri menu today. Use RESEARCH Pattern 3 (`@tauri-apps/api/menu`). |

## Metadata

**Analog search scope:** `apps/desktop/src/{routes,components,auth,lib}`, `apps/desktop/src/main.tsx`/`App.tsx`, `packages/ui/src/styles/globals.css`, `apps/desktop/public/`.
**Files scanned:** 16 source files read this session (all in-scope `.tsx`/css) + 2 planning docs.
**Pattern extraction date:** 2026-08-23
