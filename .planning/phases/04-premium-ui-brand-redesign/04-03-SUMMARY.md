---
phase: 04-premium-ui-brand-redesign
plan: 03
subsystem: ui
tags: [tailwind-v4, crafted-minimal, higgsfield, login-gate, entities, session-chip]

requires:
  - phase: 04-premium-ui-brand-redesign
    provides: Crafted Minimal :root/.dark tokens, btn-primary press, OS-follow theme, splash wordmark
  - phase: 03-entities-invoices-live-tax
    provides: entities/kunden list+panel, country→legal-form, EU-VAT create
  - phase: 02-self-hosted-backend-authentik-sso
    provides: login-gate Authentik CTA, session chip identity+logout
provides:
  - Entities/Kunden list+panel restyle (whisper separator, sage chips) matching 04/05 mockups
  - Login gate bilingual Crafted restyle (08-login) with swapped hero PNG
  - Session chip/banner restyle without Darstellung item
  - UI-SPEC error copy; four first-party Crafted PNGs in public/
  - Higgsfield leftover: 3 of 10 Starter credits
affects: [desktop-shell, UAT, 04-verify]

actuals:
  tokens: 5609
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "List rows: border-border + selected bg-muted + aria-current (whisper separator, not a painted rail)"
    - "Legal-form / entity chips: bg-primary/15 text-primary sage tint"
    - "Login gate keeps Authentik CTA and /login-gate-hero.png src; bilingual DE/EN copy, system-font Clared (D-04)"
    - "Higgsfield: cost-check gpt_image_2 before create; leftover credits recorded"

key-files:
  created:
    - apps/desktop/public/empty-entities.png
    - apps/desktop/public/splash.png
  modified:
    - apps/desktop/src/routes/entities.tsx
    - apps/desktop/src/routes/kunden.tsx
    - apps/desktop/src/auth/login-gate.tsx
    - apps/desktop/src/components/session-chip.tsx
    - apps/desktop/src/components/session-banner.tsx
    - apps/desktop/src/components/error-state.tsx
    - apps/desktop/public/login-gate-hero.png
    - apps/desktop/public/empty-state-hero.png

key-decisions:
  - "Class-only restyle; did not rebuild mockup table/search/tabs because D-11 locks IA to list+panel"
  - "Session chip gained no Darstellung/theme item (D-07 / Phase 2 D-36)"
  - "Login-gate hero generated with GPT Image 2 after cost-check (7 credits); leftover 3 of 10 Starter credits"
  - "splash.png copied into public/ but splash.tsx stays wordmark+spinner (D-16 type-only)"

patterns-established:
  - "Pattern 7: CRUD list rows are distinct bordered surfaces (whisper separator); selected uses bg-muted + aria-current"
  - "Pattern 8: Higgsfield GPT Image 2 heroes are cost-checked, then dropped as first-party public/ PNGs (D-14/D-25)"

requirements-completed: [UI-01, BRAND-01]

coverage:
  - id: D1
    description: Entities and Kunden keep list+panel, loading→empty→error, country→legal-form / EU-VAT; whisper-separator rows (border-border, selected bg-muted, aria-current); Kunden mirrors Entities
    requirement: UI-01
    verification:
      - kind: other
        ref: pnpm --filter desktop build
        status: pass
      - kind: other
        ref: grep Skeleton|Noch keine Entity|ErrorState|aria-current|border-border apps/desktop/src/routes/entities.tsx
        status: pass
      - kind: other
        ref: grep Combobox|aria-current|border-border apps/desktop/src/routes/kunden.tsx
        status: pass
    human_judgment: false
  - id: D2
    description: Login gate keeps img src=/login-gate-hero.png and system-font Clared wordmark; bilingual DE/EN copy; Sage CTA; session chip identity+logout only; banner text-destructive for unauthorized
    requirement: UI-01
    verification:
      - kind: other
        ref: pnpm --filter desktop build
        status: pass
      - kind: other
        ref: grep login-gate-hero.png|Clared apps/desktop/src/auth/login-gate.tsx
        status: pass
      - kind: other
        ref: grep Darstellung|theme apps/desktop/src/components/session-chip.tsx
        status: pass
      - kind: other
        ref: grep text-destructive apps/desktop/src/components/session-banner.tsx
        status: pass
    human_judgment: false
  - id: D3
    description: public/ holds login-gate-hero.png, empty-state-hero.png, empty-entities.png, splash.png; error-state uses UI-SPEC copy; spinner keeps prefers-reduced-motion gate; Higgsfield leftover 3 credits
    requirement: BRAND-01
    verification:
      - kind: other
        ref: pnpm --filter desktop build
        status: pass
      - kind: other
        ref: test -f apps/desktop/public/{login-gate-hero,empty-state-hero,empty-entities,splash}.png
        status: pass
      - kind: other
        ref: grep prefers-reduced-motion apps/desktop/src/components/spinner.tsx
        status: pass
      - kind: other
        ref: grep Internetverbindung apps/desktop/src/components/error-state.tsx
        status: pass
      - kind: other
        ref: higgsfield account status leftover 3 credits
        status: pass
    human_judgment: false
  - id: D4
    description: Entities, Kunden, and Login match approved Crafted mockups 04/05/08 in Light and Dark
    requirement: UI-01
    verification: []
    human_judgment: true
    rationale: 1:1 mockup fidelity is visual UAT; build and class greps cannot prove Light/Dark craft match

duration: 9min
completed: 2026-08-23
status: complete
---

# Phase 4 Plan 03: Entities / Auth / Assets Restyle Summary

**Entities/Kunden whisper-separator list+panel, bilingual Crafted login gate, and four first-party public/ PNGs including a 7-credit GPT Image 2 hero (3 Starter credits leftover)**

## Performance

- **Duration:** 9 min
- **Started:** 2026-08-23T01:21:03Z
- **Completed:** 2026-08-23T01:29:46Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Entities and Kunden restyled to 04/05 mockup language without changing list+panel IA, create/VAT, or nav.
- Login gate restyled to 08-login copy (DE primary + EN line), Sage CTA, system-font Clared; chip stays identity + logout.
- Error state uses UI-SPEC copy; Crafted empty/splash PNGs copied; login-gate hero generated after Higgsfield cost-check.

## Task Commits

Each task was committed atomically:

1. **Task 1: Entities + Kunden list+panel restyle** - `626c9f1` (feat)
2. **Task 2: Login gate + session chip + session banner restyle** - `b85cc5f` (feat)
3. **Task 3: Shared states polish + Crafted asset swap + Login-Gate hero** - `23a1756` (feat)

**Plan metadata:** (docs commit after this file)

## Files Created/Modified

- `apps/desktop/src/routes/entities.tsx` — whisper rows, sage legal-form chips, empty illustration slot, Sage submit
- `apps/desktop/src/routes/kunden.tsx` — same restyle 1:1 (shared mockup, D-12)
- `apps/desktop/src/auth/login-gate.tsx` — bilingual welcome copy, Sage CTA; hero src unchanged
- `apps/desktop/src/components/session-chip.tsx` — CHIP_CLASS + identity/logout only
- `apps/desktop/src/components/session-banner.tsx` — Card + text-destructive unauthorized
- `apps/desktop/src/components/error-state.tsx` — UI-SPEC error copy + Sage retry
- `apps/desktop/public/login-gate-hero.png` — GPT Image 2 16:9 2k (2688×1520), 7 credits
- `apps/desktop/public/empty-state-hero.png` — copied from mockups/higgsfield/empty-invoices.png
- `apps/desktop/public/empty-entities.png` — copied from mockups/higgsfield/empty-entities.png
- `apps/desktop/public/splash.png` — copied from mockups/higgsfield/splash.png

Unchanged on purpose: `skeleton.tsx` (already `animate-pulse bg-muted`), `spinner.tsx` (already reduced-motion gated).

## Higgsfield budget (D-14)

- CLI: `/opt/homebrew/bin/higgsfield`, account `slowapp@aage.feycupz.biz.id`, Starter.
- Cost-check first: `higgsfield generate cost gpt_image_2 …` → **7 credits**.
- Create `--wait` 16:9 / 2k / high; job `386447ea-3ac8-48a9-a5ca-92fea37238b9` completed.
- **Leftover: 3 of 10 credits** (`higgsfield account status` after the job).
- ChatGPT fallback **not used**. Same drop-in path remains if UAT wants a warmer oatmeal recraft: `apps/desktop/public/login-gate-hero.png`.

## Decisions Made

- Class-only restyle; mockup table/search/inspector tabs not built (D-11 IA lock).
- No theme control on the session chip (D-07).
- One GPT Image 2 job only after a 7-credit quote; leftover 3 left unspent.
- `splash.png` lives in `public/` for D-14 asset wiring; launch splash stays wordmark + spinner (D-16).

## Deviations from Plan

None - plan executed exactly as written.

Skeleton and spinner needed no class edits (tokens already flow; reduced-motion gate already present).

---

**Total deviations:** 0
**Impact on plan:** None.

## Issues Encountered

None. Higgsfield CLI authenticated; cost-check 7 ≤ 10; create succeeded.

## User Setup Required

None - Higgsfield Starter job completed in this plan. Leftover 3 credits available for Nano Banana Lite crops or a ChatGPT recraft dropped at `apps/desktop/public/login-gate-hero.png`.

## Next Phase Readiness

- Wave 2 (04-02 + 04-03) restyles are in. Ready for phase verify / UAT against 04/05/08 mockups in both themes.
- Do not add nav items or a chip theme control.

---
*Phase: 04-premium-ui-brand-redesign*
*Completed: 2026-08-23*

## Self-Check: PASSED
