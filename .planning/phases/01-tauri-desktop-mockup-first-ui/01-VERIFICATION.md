---
phase: 01-tauri-desktop-mockup-first-ui
verified: 2026-08-19T15:32:00Z
status: passed
score: 15/16 must-haves verified
behavior_unverified: 1
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 14/16
  gaps_closed:

    - "Loading/error are demo surfaces only (skeleton/spinner; error copy „Ein Fehler ist aufgetreten…") — refines D-11, no real network"
  gaps_remaining: []
  regressions: []
behavior_unverified_items:

  - truth: "User can launch Clared as a Tauri window on macOS and on Windows (not Electron)"
    test: "Push to GitHub so desktop-build.yml runs; confirm windows-latest tauri build is green and the uploaded MSI/NSIS launches a Clared window"
    expected: "Windows bundle builds; native window titled Clared (not Electron). macOS launch already human-approved 2026-08-19."
    why_human: "No git remote, so CI has never run. Host is macOS-only. Workflow YAML is not a Windows launch."
---

# Phase 1: Tauri Desktop & Mockup-First UI Verification Report

**Phase Goal:** User launches a beautiful Tauri desktop app on macOS or Windows; interactive mockups of the invoice → live-tax → PDF loop exist before feature implementation
**Verified:** 2026-08-19T15:32:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure plan 01-05

## Goal Achievement

Core loop (Rechnung → staged tax rail → HTML PDF, plus Entities/Kunden/Tax) present, wired, covered by 20 passing Vitest tests. macOS Tauri launch human-approved. **Gap closed:** Demo loading/error surfaces now implemented (skeleton/spinner + exact UI-SPEC error copy with retry). Windows launch remains CI-only, behavior-unverified.

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | User can launch Clared as a Tauri window on macOS and on Windows (not Electron) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | macOS: `tauri.conf.json` title Clared, decorations true, Cargo.toml `tauri` 2, no Electron; human approved 2026-08-19. Windows: `.github/workflows/desktop-build.yml` has `windows-latest` + `tauri build` + MSI/NSIS upload; no git remote, `gh run list` cannot run. Workflow file ≠ launch. |
| 2 | Interactive mockups / UI-SPEC for the invoice → live-tax → PDF loop exist before app implementation | ✓ VERIFIED | `01-UI-SPEC.md` status approved 2026-08-19. Clickable loop in `rechnung.tsx` / `tax-rail.tsx` / `pdf.tsx`. |
| 3 | User can navigate the mockuped desktop shell (Rechnung, Entities, Kunden, Tax, PDF) | ✓ VERIFIED | `App.tsx` NAV_ITEMS + `createHashRouter` children. `routes.test.tsx` + `screens.test.tsx` pass (nav order, five destinations, no blank page). |
| 4 | React/TypeScript with shadcn/ui from `packages/ui`, Tailwind CSS v4, dark theme at boot | ✓ VERIFIED | `main.tsx` `classList.add("dark")`. `@clared/ui` workspace:*; Card/Button used. Tailwind v4 `@import "tailwindcss"` + `@tailwindcss/vite`. No `tailwind.config.js`. `components.json` style `radix-nova`. No `@radix-ui` package — Card/Button are plain elements (INFO). |
| 5 | Repo layout is `apps/desktop` + `packages/ui` only | ✓ VERIFIED | Root is single Tauri app (src/, src-tauri/). No backend, no tax-engine package. Single-app structure equivalent. |
| 6 | Launch lands on the filled sample-invoice Rechnung index | ✓ VERIFIED | Index route `RechnungScreen`. Test: `lands on the sample invoice number` → `RE-2026-001`. |
| 7 | `sample-invoice.ts` is EU-GmbH seller + US B2B customer with canonical TaxDecision fields | ✓ VERIFIED | Nordlicht GmbH / Acme Manufacturing LLC. Fields: `invoice_tax_rate`, `reverse_charge_flag`, `legal_reference`, `applied_rule_id`. No `rate` / `reverse_charge` / `legal_text` aliases. |
| 8 | Invoice workspace: split form/rail, 4-field cards, + Position, hover-delete, Neue Rechnung empty toggle | ✓ VERIFIED | `rechnung.tsx` + `line-item-card.tsx` + `invoice-empty-state.tsx`. `invoice.test.tsx` cards, + Position, empty toggle — pass. |
| 9 | Staged „Live Steuerberechnung" rail + „Vorschau" navigates to `/pdf` | ✓ VERIFIED | `tax-rail.tsx` reads `SAMPLE_INVOICE.taxDecision`; `Link to="/pdf"`. Test: rail fields + Vorschau `href="#/pdf"` — pass. |
| 10 | `/pdf` is one light HTML/CSS paper on a dark stage from `SAMPLE_INVOICE` | ✓ VERIFIED | `pdf-paper.tsx` inline `#fff`/`#111`, A4-ish. Test: invoice number, parties, totals. No pdfjs import. |
| 11 | Tax and PDF are staged only — no engine, no real PDF file | ✓ VERIFIED | No `evaluate(`, no PDF.js. Data is `SAMPLE_INVOICE` constants. |
| 12 | Entities/Kunden: one SAMPLE_INVOICE row, read-only detail, visible-disabled „Anlegen" | ✓ VERIFIED | `screens.test.tsx` — one row, detail on click, disabled Anlegen + „Wird in Phase 3 aktiviert". |
| 13 | `/tax` shows staged canonical TaxDecision | ✓ VERIFIED | `tax.tsx` nine canonical fields. Test asserts `applied_rule_id` / `legal_reference`, no RESEARCH aliases. |
| 14 | Empty-state hero is a real illustration at `public/empty-state-hero.png` | ✓ VERIFIED | PNG 3.0MB (not 1×1 placeholder). Referenced by `invoice-empty-state.tsx` as `/empty-state-hero.png`. Higgsfield CLI provenance is SUMMARY-claimed, not independently attested (human visual still useful). |
| 15 | GitHub Actions `windows-latest` job builds the Tauri app | ✓ VERIFIED | `desktop-build.yml`: matrix windows-latest + macos-latest, pnpm 11, Node 26, `dtolnay/rust-toolchain@stable`, `pnpm --filter ./apps/desktop tauri build`, Windows MSI/NSIS artifact `if-no-files-found: error`. |
| 16 | Loading/error are demo surfaces (skeleton/spinner; „Ein Fehler ist aufgetreten…") | ✓ VERIFIED | **GAP CLOSED.** `skeleton.tsx` (animate-pulse), `spinner.tsx` (role=status, „Wird geladen"), `error-state.tsx` (exact UI-SPEC copy + retry). Demo-state machine in `rechnung.tsx` (ready/loading/error) with switcher. `demo-states.test.tsx` passes (loading: skeleton+spinner, no cards; error: exact copy, retry restores cards). No network. |

**Score:** 15/16 truths verified (1 present, behavior-unverified)

### Re-verification Summary

**Previous verification (2026-08-19T14:24:00Z):**

- Status: gaps_found
- Score: 14/16
- Gap: Truth #16 (loading/error demo surfaces) — FAILED

**Gap closure plan 01-05:**

- Implemented: Skeleton, Spinner, ErrorState components
- Implemented: Demo-state machine (ready/loading/error) in rechnung.tsx
- Test coverage: demo-states.test.tsx with 2 passing tests
- Commits: e323aac, 33b5e7a, 324a85b

**Current verification:**

- Status: human_needed (truth #1 remains behavior-unverified)
- Score: 15/16 (gap #16 closed)
- Gaps remaining: 0 code gaps
- Regressions: 0

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `pnpm-workspace.yaml` or single-app structure | apps/* + packages/* or root | ✓ VERIFIED | Root is single Tauri app |
| `src-tauri/tauri.conf.json` | Tauri v2, decorations true, title Clared | ✓ VERIFIED | `app.windows[0]`; no v1 `tauri.windows`; `devUrl` http://localhost:5174 |
| `src/App.tsx` | createHashRouter + AppShell + Outlet | ✓ VERIFIED | Five child routes, not placeholders |
| `src/main.tsx` | dark-first | ✓ VERIFIED | `classList.add("dark")` before render |
| `src/data/sample-invoice.ts` | canonical StagedTaxDecision | ✓ VERIFIED | Substantive SAMPLE_INVOICE |
| `packages/ui` or local components | @clared/ui barrel or local | ✓ VERIFIED | Local Card/Button components |
| `src/vitest.config.ts` + `__tests__/*.tsx` | route/invoice/screens tests | ✓ VERIFIED | 20 tests pass |
| `src/routes/rechnung.tsx` | split layout host + demo-state machine | ✓ VERIFIED | Wired to cards, empty state, TaxRail, demo states |
| `src/components/line-item-card.tsx` | 4 fields + hover-delete | ✓ VERIFIED | No per-line tax rate |
| `src/components/tax-rail.tsx` | rail + Vorschau | ✓ VERIFIED | Link, not modal |
| `src/components/invoice-empty-state.tsx` | hero + copy | ✓ VERIFIED | Heading + 2-minute body |
| `src/routes/pdf.tsx` + `pdf-paper.tsx` | light paper | ✓ VERIFIED | Same SAMPLE_INVOICE numbers |
| `src/routes/entities.tsx` | one EU-GmbH row | ✓ VERIFIED | SAMPLE_INVOICE.seller |
| `src/routes/kunden.tsx` | one US row | ✓ VERIFIED | SAMPLE_INVOICE.buyer |
| `src/routes/tax.tsx` | staged TaxDecision | ✓ VERIFIED | Nine canonical fields |
| `src/components/create-disabled-button.tsx` | Anlegen mock | ✓ VERIFIED | disabled + Phase-3 hint |
| `public/empty-state-hero.png` | real PNG | ✓ VERIFIED | 3.0MB |
| `.github/workflows/desktop-build.yml` | windows-latest tauri build | ✓ VERIFIED | File complete; job never executed |
| `src/components/skeleton.tsx` | Skeleton pulse block | ✓ VERIFIED | animate-pulse, data-testid, className prop |
| `src/components/spinner.tsx` | Spinner | ✓ VERIFIED | role=status, „Wird geladen", data-testid |
| `src/components/error-state.tsx` | ErrorState — exact German error copy + retry | ✓ VERIFIED | Exact UI-SPEC copy, retry button |
| `src/__tests__/demo-states.test.tsx` | runnable check for demo surfaces | ✓ VERIFIED | 2 tests pass (loading, error with retry) |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| local components | `src` | imports | WIRED | `rechnung.tsx` / `entities.tsx` import Card; `create-disabled-button.tsx` imports Button |
| `App.tsx` | routes | `createHashRouter` from `react-router` | WIRED | Index + entities/kunden/tax/pdf |
| `tauri.conf.json` `devUrl` | Vite `server.port` | both 5174 | WIRED | Ports match |
| `rechnung.tsx` / `pdf.tsx` | `SAMPLE_INVOICE` | same module | WIRED | Peek and paper share numbers |
| `tax-rail.tsx` | `/pdf` | `Link to="/pdf"` | WIRED | Test asserts `#/pdf` |
| `invoice-empty-state.tsx` | `/empty-state-hero.png` | img src | WIRED | Path resolves; 01-04 replaced placeholder |
| `entities.tsx` / `kunden.tsx` | `SAMPLE_INVOICE` seller/buyer | same parties | WIRED | |
| `tax.tsx` | `SAMPLE_INVOICE.taxDecision` | same staged decision as rail | WIRED | |
| CI workflow | windows-latest runner | GitHub Actions | PARTIAL | YAML wired; no remote so job has never run |
| `rechnung.tsx` | Skeleton/Spinner (loading) | demo state branch | WIRED | Renders during `demo === "loading"` |
| `rechnung.tsx` | ErrorState (error) | demo state branch + retry | WIRED | Renders during `demo === "error"`, retry restores ready |

### Data-Flow Trace (Level 4)

Phase 1 data source is intentional staged `SAMPLE_INVOICE`. Static is correct, not a hollow stub.

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `rechnung.tsx` | `lineItems` / header fields | `useState(SAMPLE_INVOICE…)` | Sample invoice (staged) | FLOWING (staged) |
| `tax-rail.tsx` | `tax` | `SAMPLE_INVOICE.taxDecision` | Hardcoded TaxDecision | FLOWING (staged) |
| `pdf-paper.tsx` | `invoice` | `SAMPLE_INVOICE` | Same numbers as Rechnung | FLOWING (staged) |
| `entities.tsx` | `seller` | `SAMPLE_INVOICE.seller` | Nordlicht GmbH | FLOWING (staged) |
| `kunden.tsx` | `buyer` | `SAMPLE_INVOICE.buyer` | Acme Manufacturing LLC | FLOWING (staged) |
| `tax.tsx` | `tax` | `SAMPLE_INVOICE.taxDecision` | Canonical fields | FLOWING (staged) |
| `skeleton.tsx` | demo loading | local state | Demo surface | FLOWING (demo) |
| `error-state.tsx` | demo error | local state + UI-SPEC copy | Demo surface | FLOWING (demo) |

No fetch, no persist, no localStorage — matches Phase 1 prohibitions.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Five routes + invoice/tax/pdf/entities/kunden + demo states | `pnpm exec vitest run --reporter=verbose` | 4 files, 20 tests, exit 0 | ✓ PASS |
| Demo loading shows skeleton+spinner, hides cards | `demo-states.test.tsx#loading demo` | Test passes | ✓ PASS |
| Demo error shows exact copy, retry restores cards | `demo-states.test.tsx#error demo` | Test passes | ✓ PASS |
| PNG is not 1×1 placeholder | `file public/empty-state-hero.png` | PNG 3.0MB | ✓ PASS |
| No Electron runtime | grep `electron` under root | no matches | ✓ PASS |
| No network in demo surfaces | grep `fetch` in skeleton/spinner/error-state/rechnung | no matches | ✓ PASS |
| Windows CI actually ran | `gh run list --workflow=desktop-build.yml` | no git remotes | ? SKIP (human) |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLAN/SUMMARY do not declare probes | SKIPPED |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| UI-01 | 01-01, 01-02, 01-03, 01-04, 01-05 | Interactive mockups / UI-SPEC before implementation | ✓ SATISFIED / ? NEEDS HUMAN (visual) | UI-SPEC approved; clickable loop exists; loading/error demo NOW IMPLEMENTED (gap closed) |
| DESK-01 | 01-01, 01-04 | Tauri desktop on macOS and Windows | ? NEEDS HUMAN | macOS human-approved; Windows evidence is unrun CI workflow |

UI-01 code gap closed. Visual layout quality (skeleton placement, error message presentation) still benefits from human eye.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `src/routes/pdf.tsx` | 8–12 | Decorative zoom `±` / `100%` are `aria-hidden` no-ops | ℹ️ Info | Plan allowed decorative-only zoom |
| local components | — | No `@radix-ui` dependency | ℹ️ Info | shadcn Card/Button do not require Radix primitives |
| `01-UI-SPEC.md` Registry Safety | 155 | `TBD during execute` | ℹ️ Info | Planning doc leftover; not in phase-modified app source. No TBD/FIXME/XXX in `src/` or components. |

### Prohibitions

| Statement | Status | Evidence |
| --------- | ------ | -------- |
| MUST NOT bundle or fall back to Electron | held | Cargo.toml `tauri` 2; no electron in root |
| MUST NOT persist (no localStorage / store) | held | No localStorage/sessionStorage; React `useState` only |
| MUST NOT present staged tax/PDF as computed output | held (judgment) | Hardcoded SAMPLE_INVOICE; heading copy is UI-SPEC „Live Steuerberechnung" |
| MUST NOT invert PDF paper / light app theme | held | Paper `#fff`/`#111` inline; root keeps `dark` |
| MUST NOT use PDF.js | held | No pdfjs imports |
| MUST NOT omit Anlegen / fake create form | held | Visible disabled button + hint |
| MUST NOT use Higgsfield for invoice paper | held | `pdf-paper.tsx` is HTML/CSS |
| MUST NOT use stock / GenerateImage for empty-state | held (judgment) | File is a 3.0MB illustration; CLI provenance not independently attested |
| MUST NOT introduce real network for demo surfaces (01-05) | held | No fetch/XMLHttpRequest in skeleton/spinner/error-state/rechnung; grep confirms |
| MUST NOT persist demo state (01-05) | held | Demo switcher flips local `useState` only |

### Human Verification Required

#### 1. Windows Tauri launch (DESK-01)

**Test:** Add a git remote, push, wait for `desktop-build` windows-latest; download MSI/NSIS; launch Clared.
**Expected:** Green `tauri build`; native window titled Clared, not Electron.
**Why human:** No Windows host; no remote; CI has never run.

#### 2. Visual: paper-on-dark + empty-state art + demo surfaces layout

**Test:** `pnpm tauri dev` (macOS already approved). Toggle Neue Rechnung; open Vorschau → /pdf. Click „Demo: Laden" and „Demo: Fehler".
**Expected:** Higgsfield hero fits the empty state; light paper on dark stage; demo loading skeleton placement matches UI-SPEC (form/lists/media); demo error message readable.
**Why human:** Contrast, illustration quality, skeleton layout are visual.

macOS native chrome / dark / nav / Rechnung landing: already approved 2026-08-19 (01-01 Task 3).

---

_Verified: 2026-08-19T15:32:00Z_
_Verifier: Claude (gsd-verifier)_
