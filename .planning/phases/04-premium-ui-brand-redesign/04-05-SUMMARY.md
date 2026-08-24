---
phase: 04-premium-ui-brand-redesign
plan: 05
subsystem: ui
tags: [theme, empty-state, login-gate, crafted-minimal, vitest, gap-closure]

requires:
  - phase: 04-premium-ui-brand-redesign
    provides: applyTheme html+body D-02 paint, empty-state hero PNG, login-gate-hero.png, LoginGate session.login
provides:
  - syncSystemAppearance re-paints html+body when pref is system (G-04-6)
  - InvoiceEmptyState return CTA Beispielrechnung anzeigen (G-04-4)
  - LoginGate first-party /login-gate-hero.png plus font-sans Clared (G-04-5)
affects: [verify-work, 04-UAT, desktop-boot, login]

actuals:
  tokens: 3140
  tasks: 3
  commits: 6

tech-stack:
  added: []
  patterns:
    - "matchMedia change calls syncSystemAppearance; locked Hell/Dunkel no-op"
    - "Empty canvas CTA copy is Beispielrechnung anzeigen; header Neue Rechnung erstellen stays"
    - "LoginGate hero is public/login-gate-hero.png; wordmark system sans"

key-files:
  created: []
  modified:
    - apps/desktop/src/main.tsx
    - apps/desktop/src/lib/theme.ts
    - apps/desktop/src/lib/theme.test.ts
    - apps/desktop/src/components/invoice-empty-state.tsx
    - apps/desktop/src/__tests__/phase03-autosave.test.tsx
    - apps/desktop/src/auth/login-gate.tsx
    - apps/desktop/src/__tests__/auth-gate.test.tsx

key-decisions:
  - "OS appearance sync reuses applyTheme('system') so inline D-02 hex and .dark stay aligned"
  - "Hell/Dunkel ignore matchMedia because syncSystemAppearance returns unless currentPref() is system"
  - "Empty CTA copy restored to UI-SPEC; startNewDraft and showRail = !showHero unchanged"
  - "Login hero reuses 04-03 public PNG; no Higgsfield; canvas bg-background"

patterns-established:
  - "Pattern 1: OS listener never classList.toggle alone after inline html/body paint"
  - "Pattern 2: Empty-list RTL clicks Beispielrechnung anzeigen, not the header create label"
  - "Pattern 3: LoginGate decorative img alt empty; OIDC path stays open_login_window"

requirements-completed: [UI-01, BRAND-01]

coverage:
  - id: D1
    description: While Darstellung is System, OS color-scheme change re-paints html and body Pale Oatmeal or Deep Charcoal via applyTheme
    requirement: BRAND-01
    verification:
      - kind: unit
        ref: apps/desktop/src/lib/theme.test.ts#syncSystemAppearance paints oatmeal and drops dark when pref is system and OS is light
        status: pass
      - kind: other
        ref: pnpm --filter desktop exec vitest run src/lib/theme.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Empty invoice canvas return CTA is Beispielrechnung anzeigen; tax rail and Vorschau stay hidden while showHero
    requirement: UI-01
    verification:
      - kind: unit
        ref: apps/desktop/src/__tests__/phase03-autosave.test.tsx#shows Speichert then Gespeichert after the 600ms typing pause
        status: pass
      - kind: other
        ref: python assert Beispielrechnung anzeigen, empty-state-hero.png, showRail = !showHero
        status: pass
    human_judgment: false
  - id: D3
    description: Unsigned LoginGate shows /login-gate-hero.png, system-font Clared, and Anmelden still invokes open_login_window
    requirement: BRAND-01
    verification:
      - kind: unit
        ref: apps/desktop/src/__tests__/auth-gate.test.tsx#unsigned gate shows Clared, body copy, Anmelden, and no navigation
        status: pass
      - kind: other
        ref: pnpm --filter desktop exec vitest run src/__tests__/auth-gate.test.tsx
        status: pass
    human_judgment: false
  - id: D4
    description: Live OS Light/Dark flip with Darstellung=System paints canvas hex and tokens together (04-UAT test 3)
    requirement: BRAND-01
    verification: []
    human_judgment: true
    rationale: jsdom cannot flip macOS appearance; 04-UAT test 3 needs a human OS toggle

duration: 3min
completed: 2026-08-23
status: complete
---

# Phase 4 Plan 5: Gap closure G-04-4/5/6 Summary

**OS system-pref matchMedia now re-paints html+body D-02 oatmeal/charcoal via `syncSystemAppearance`; empty invoice CTA is Beispielrechnung anzeigen; LoginGate wires `/login-gate-hero.png` and `font-sans` Clared.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-23T05:03:30Z
- **Completed:** 2026-08-23T05:06:14Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Exported `syncSystemAppearance`; `main.tsx` prefers-color-scheme listener calls it only (G-04-6).
- Empty-state primary accessible name is Beispielrechnung anzeigen; autosave RTL clicks that name (G-04-4).
- LoginGate decorative hero PNG + system sans wordmark; Anmelden still `session.login` / `open_login_window` (G-04-5).

## Task Commits

Each task was committed atomically (TDD RED then GREEN):

1. **Task 1 RED:** `f48ca56` (test) add failing test for syncSystemAppearance OS paint
2. **Task 1 GREEN:** `d41cf14` (feat) re-paint html+body on OS appearance via applyTheme
3. **Task 2 RED:** `f9afff6` (test) require empty-state CTA Beispielrechnung anzeigen
4. **Task 2 GREEN:** `3b2a084` (feat) set empty-state return CTA to Beispielrechnung anzeigen
5. **Task 3 RED:** `b702efc` (test) require LoginGate Crafted hero img src
6. **Task 3 GREEN:** `9a6edb9` (feat) wire LoginGate Crafted hero and system-font wordmark

**Plan metadata:** docs commit follows this SUMMARY

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified

- `apps/desktop/src/lib/theme.ts` - `syncSystemAppearance` applies `applyTheme("system")` only when pref is system
- `apps/desktop/src/lib/theme.test.ts` - system-follow and Hell/Dunkel lock cases
- `apps/desktop/src/main.tsx` - matchMedia change calls `syncSystemAppearance`
- `apps/desktop/src/components/invoice-empty-state.tsx` - return CTA copy
- `apps/desktop/src/__tests__/phase03-autosave.test.tsx` - empty-list click name
- `apps/desktop/src/auth/login-gate.tsx` - hero img, font-sans, `bg-background`
- `apps/desktop/src/__tests__/auth-gate.test.tsx` - hero src assertion

## Decisions Made

- Re-invoke `applyTheme("system")` on OS change rather than `classList.toggle("dark")` so inline html/body background from 04-04 stays aligned.
- Locked light/dark prefs ignore OS events (T-04-12).
- Reuse existing `apps/desktop/public/login-gate-hero.png`; no Higgsfield job (D-14).
- Sequential dirty restyle on empty-state and login-gate kept and committed with gap-closure (orchestrator instruction).

## Deviations from Plan

None - plan executed as written. Sequential dirty restyle on two plan files was included per orchestrator, not a Rule 1–3 auto-fix.

**Total deviations:** 0 auto-fixed
**Impact on plan:** None

## Issues Encountered

None. Live OS appearance flip and splash hold remain human UAT (04-UAT). gsd-browser was `about:blank`; automated vitest + python gates covered the three code gaps.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

G-04-4, G-04-5, G-04-6 closed in code. Phase 04 last plan complete pending verify-work / human UAT 1–3. G-04-1/2/3 not reopened. Splash min-hold still PBU. Phase 05 PDF/Audit/Offline still deferred.

---
*Phase: 04-premium-ui-brand-redesign*
*Completed: 2026-08-23*

## Self-Check: PASSED
