---
phase: 01-tauri-desktop-mockup-first-ui
plan: 01
subsystem: ui
tags: [tauri, react, vite, shadcn, tailwind-v4, rust, vitest, hash-router]

requires: []
provides:
  - Tauri 2 desktop shell (native decorations, title Clared)
  - pnpm monorepo apps/desktop + packages/ui
  - @clared/ui shadcn/Radix barrel with Tailwind v4 dark tokens
  - createHashRouter AppShell with five-item sidebar
  - sample-invoice.ts canonical StagedTaxDecision + Rechnung tracer
  - Vitest route harness (jsdom)
affects: [01-02-invoice-canvas, 01-03-entities-kunden-tax, 01-04-higgsfield-windows-ci]

actuals:
  tokens: 79824
  tasks: 3
  commits: 6

tech-stack:
  added:
    - Tauri 2.11
    - React 19
    - Vite 8
    - Tailwind CSS v4
    - shadcn/ui + Radix
    - react-router 8
    - vitest + Testing Library + jsdom
    - rustc/cargo (rustup)
  patterns:
    - pnpm workspace apps/* + packages/*
    - @clared/ui source export (Vite resolves workspace:*, no package build)
    - createHashRouter from react-router (not react-router-dom)
    - dark-first documentElement.classList.add("dark") at boot
    - canonical TaxDecision field names from tax-engine architecture

key-files:
  created:
    - pnpm-workspace.yaml
    - apps/desktop/src-tauri/tauri.conf.json
    - apps/desktop/src/main.tsx
    - apps/desktop/src/App.tsx
    - apps/desktop/src/data/sample-invoice.ts
    - apps/desktop/src/routes/rechnung.tsx
    - apps/desktop/src/__tests__/routes.test.tsx
    - packages/ui/src/index.ts
    - packages/ui/src/styles/globals.css
  modified:
    - apps/desktop/vite.config.ts
    - apps/desktop/src-tauri/tauri.conf.json

key-decisions:
  - "React 19 + Vite 8 + Tauri 2 for the desktop client (Phase 1 UI stack lock)"
  - "createHashRouter from react-router so sub-routes survive tauri://localhost"
  - "Vite/Tauri bound to 5174 because 5173 was occupied by BILLIT Vite"
  - "StagedTaxDecision uses canonical tax-engine fields (invoice_tax_rate, reverse_charge_flag, legal_reference) not RESEARCH aliases"

patterns-established:
  - "Pattern 1: HashRouter shell — App.tsx createHashRouter + AppShell NavLink sidebar + Outlet"
  - "Pattern 2: Design system lives in packages/ui; apps/desktop imports @clared/ui via workspace:*"
  - "Pattern 3: Dark boot in main.tsx before render; no localStorage theme"
  - "Pattern 4: Sample data module apps/desktop/src/data/sample-invoice.ts with canonical TaxDecision fields"

requirements-completed: [UI-01, DESK-01]

coverage:
  - id: D1
    description: "Tauri 2 pnpm monorepo (apps/desktop + packages/ui) with shadcn/Radix Tailwind v4 dark-first design system and Vitest harness"
    requirement: DESK-01
    verification:
      - kind: other
        ref: "rustc --version && cargo --version && tsc --noEmit (apps/desktop)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Dark HashRouter AppShell with Rechnung · Entities · Kunden · Tax · PDF nav; index route renders SAMPLE_INVOICE through @clared/ui Card"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/routes.test.tsx#five navigable routes + sample invoice on index"
        status: pass
    human_judgment: false
  - id: D3
    description: "Native macOS Clared window launches (OS titlebar, dark theme, correct nav, lands on Rechnung)"
    requirement: DESK-01
    verification:
      - kind: manual_procedural
        ref: "pnpm tauri dev — human-verify checkpoint Task 3"
        status: pass
    human_judgment: true
    rationale: "Native window chrome vs Electron/browser-tab is a visual judgment no unit test can assert; user typed approved 2026-08-19"

duration: 17min
completed: 2026-08-19
status: complete
---

# Phase 1 Plan 01: Foundation Tracer Summary

**Tauri 2 macOS window with HashRouter AppShell, shadcn dark tokens, and sample-invoice Rechnung tracer via @clared/ui**

## Performance

- **Duration:** 17 min
- **Started:** 2026-08-19T13:08:44Z
- **Completed:** 2026-08-19T13:26:00Z
- **Tasks:** 3
- **Files modified:** 57

## Accomplishments

- Rust toolchain installed; Tauri 2 monorepo scaffolded as `apps/desktop` + `packages/ui` only (no backend, no tax-engine package)
- Dark-first boot, `createHashRouter` AppShell, five-item sidebar, sample-invoice Rechnung index rendered through `@clared/ui` Card
- Human-approved native Clared window on macOS (decorations on, title Clared)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Rust + scaffold Tauri 2 monorepo with shadcn/ui dark-first design system** - `91e3427` (feat)
2. **Task 2: Tracer — dark boot → HashRouter → AppShell → sample-invoice Rechnung** - `a68e1ef` (test RED), `6f1af90` (feat GREEN)
3. **Task 2b: Port match (5173 occupied by BILLIT Vite)** - `79bede6` (fix)
4. **Task 2c: Cargo.lock from first compile** - `a0288e9` (chore)
5. **Task 3: Human verify — Tauri window launches on macOS** - approved (no code commit; visual checkpoint)

**Plan metadata:** pending docs(01-01) complete-plan commit (this close-out)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## TDD Gate Compliance

- RED: `a68e1ef` `test(01-01): add failing test for sidebar routes and sample invoice`
- GREEN: `6f1af90` `feat(01-01): implement dark HashRouter shell and sample-invoice tracer`
- REFACTOR: none (GREEN already clean)

## Files Created/Modified

- `pnpm-workspace.yaml` - apps/* + packages/* globs
- `apps/desktop/src-tauri/tauri.conf.json` - Tauri v2 `app.windows[]`, title Clared, decorations true, devUrl port 5174
- `apps/desktop/vite.config.ts` - Vite 8 + Tauri plugin, strictPort 5174
- `apps/desktop/src/main.tsx` - `classList.add("dark")` before render
- `apps/desktop/src/App.tsx` - HashRouter, AppShell, NAV_ITEMS, placeholder sibling routes
- `apps/desktop/src/data/sample-invoice.ts` - StagedTaxDecision / LineItem / SAMPLE_INVOICE
- `apps/desktop/src/routes/rechnung.tsx` - tracer screen using `@clared/ui` Card
- `apps/desktop/src/__tests__/routes.test.tsx` - five routes + invoice number
- `packages/ui/src/index.ts` - `@clared/ui` barrel
- `packages/ui/src/styles/globals.css` - Tailwind v4 dark tokens
- `apps/desktop/src-tauri/Cargo.lock` - first `tauri dev` compile lockfile
- `01-USER-SETUP.md` - rustup already applied; new-shell PATH note

## Decisions Made

- Locked Phase 1 UI stack to React 19 + Vite 8 + Tauri 2 (was pending in PROJECT.md)
- `createHashRouter` from `react-router` so production `tauri://localhost` keeps sub-routes
- Bound Vite and Tauri `devUrl` to **5174** after 5173 was already taken by BILLIT Vite
- Canonical TaxDecision field names from `docs/clared-tax-engine-architecture.md`, not RESEARCH aliases

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vite/Tauri bound to port 5174**
- **Found during:** Task 2 tracer launch (`pnpm tauri dev`)
- **Issue:** Plan assumed `http://localhost:5173`. Port 5173 was occupied by BILLIT Vite, so Clared could not bind.
- **Fix:** Set Vite `server.port` / `strictPort` and Tauri `build.devUrl` to `http://localhost:5174`
- **Files modified:** `apps/desktop/vite.config.ts`, `apps/desktop/src-tauri/tauri.conf.json`
- **Verification:** `pnpm tauri dev` served the UI; human checkpoint approved the native window
- **Committed in:** `79bede6` (Task 2b)

**2. [Rule 3 - Blocking] Checked in Cargo.lock after first compile**
- **Found during:** Task 2 first `tauri dev` / cargo compile
- **Issue:** Scaffold did not include `apps/desktop/src-tauri/Cargo.lock`; first compile generated it as untracked
- **Fix:** Commit the lockfile so subsequent builds are reproducible
- **Files modified:** `apps/desktop/src-tauri/Cargo.lock`
- **Verification:** File tracked; later `tauri dev` uses locked crates
- **Committed in:** `a0288e9` (Task 2c)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Port remap is a local-dev collision, not a product change. Lockfile is scaffold completeness. No scope creep. Wave 2 plans untouched.

## Issues Encountered

- Port 5173 occupied by BILLIT Vite — remapped to 5174 (see deviation 1)
- Windows launch parity still unverified on this macOS host — deferred to 01-04 `windows-latest` CI (flagged assumption on the plan)

## Known Stubs

Intentional Phase-1 placeholders. Tracer goal is met; siblings expand these.

| File | Line | Stub | Resolves in |
|------|------|------|-------------|
| `apps/desktop/src/App.tsx` | 25, 71–74 | `PlaceholderScreen` for Entities / Kunden / Tax / PDF | 01-02, 01-03 |
| `apps/desktop/public/empty-state-hero.png` | — | 1×1 PNG placeholder | 01-04 |

## User Setup Required

**External services require manual configuration.** See [01-USER-SETUP.md](./01-USER-SETUP.md) for:

- Rust PATH in new shells (`source $HOME/.cargo/env`) if `rustc` is not already on PATH
- rustup itself already ran during Task 1 (status Complete)

## Next Phase Readiness

- Ready for **01-02-PLAN.md** (invoice canvas: split form/rail, line-item cards, staged tax rail)
- Do not start Wave 2 from this executor; orchestrator owns dispatch
- macOS tracer proven; Windows DESK-01 gate remains 01-04

## Self-Check: PASSED

- FOUND: `.planning/phases/01-tauri-desktop-mockup-first-ui/01-01-SUMMARY.md`
- FOUND: `.planning/phases/01-tauri-desktop-mockup-first-ui/01-USER-SETUP.md`
- FOUND: `91e3427` `a68e1ef` `6f1af90` `79bede6` `a0288e9`

---
*Phase: 01-tauri-desktop-mockup-first-ui*
*Completed: 2026-08-19*
