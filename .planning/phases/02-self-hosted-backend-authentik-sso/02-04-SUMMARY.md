---
phase: 02-self-hosted-backend-authentik-sso
plan: 04
subsystem: auth
tags: [tauri2, react, authentik, login-gate, session-chip, higgsfield, shadcn]

requires:
  - phase: 02-self-hosted-backend-authentik-sso
    provides: redeemTicket/fetchMe/logoutSession API client and Tauri open_login_window + keychain commands
provides:
  - Full-screen signed-out LoginGate (Clared / Anmelden copy, /login-gate-hero.png)
  - SessionProvider boot/unsigned/signed/boot-error wrapping the hash router
  - Sidebar SessionChip with German primaryRole badge and Rolle/Abmelden menu
  - 401 alert + cancel status banners; network still uses Phase 1 ErrorState
  - Higgsfield GPT Image 2 gate hero PNG 2688×1520
affects:
  - 02-05 live Authentik paint in the login WebView
  - Phase 1 invoice/entity/kunden/tax/PDF screens (signed-in only)

actuals:
  tokens: 14436
  tasks: 3
  commits: 5

tech-stack:
  added:
    - "shadcn official badge + dropdown-menu in @clared/ui (radix-ui, class-variance-authority)"
    - "Higgsfield GPT Image 2 login-gate-hero.png"
  patterns:
    - "SessionProvider outside createHashRouter; gate is not a hash route"
    - "Default vitest doubles: keychain token + /me 200 so Phase 1 App tests wait for the signed-in shell"
    - "open_login_window optional url for Authentik end_session after Abmelden"

key-files:
  created:
    - apps/desktop/src/auth/login-gate.tsx
    - apps/desktop/src/auth/session-provider.tsx
    - apps/desktop/src/components/session-chip.tsx
    - apps/desktop/src/components/session-banner.tsx
    - apps/desktop/src/__tests__/auth-test-doubles.ts
    - packages/ui/src/components/badge.tsx
    - packages/ui/src/components/dropdown-menu.tsx
    - apps/desktop/public/login-gate-hero.png
  modified:
    - apps/desktop/src/App.tsx
    - apps/desktop/src/auth/api.ts
    - apps/desktop/src/components/spinner.tsx
    - apps/desktop/src-tauri/src/lib.rs
    - packages/ui/src/index.ts
    - apps/desktop/src/__tests__/auth-gate.test.tsx
    - apps/desktop/src/__tests__/routes.test.tsx
    - apps/desktop/vitest.config.ts

key-decisions:
  - "Chip/banner live in components/ (error-state analog); Wave 0 dynamic imports updated from auth/"
  - "open_login_window gained optional url so Abmelden can load logoutSession endSessionUrl"
  - "vitest fileParallelism false because shared Tauri/fetch doubles raced across files"

patterns-established:
  - "Unsigned: LoginGate only. Boot: full-viewport Spinner. Signed: existing AppShell + hash router"
  - "401 keeps shell + banner + login window + replayLastRequest; network is ErrorState"
  - "Chip accessible name is display name via aria-label; badge map is German-only"

requirements-completed: [AUTH-01]

coverage:
  - id: D1
    description: Unsigned full-screen gate with Clared, Anmelden copy, hero path, no AppShell
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/auth-gate.test.tsx#unsigned gate shows Clared"
        status: pass
    human_judgment: false
  - id: D2
    description: Silent keychain boot spinner then sample invoice; /me 401 gate; network ErrorState retry
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/auth-gate.test.tsx#boot with keychain token"
        status: pass
    human_judgment: false
  - id: D3
    description: Session chip German badges, email fallback, Rolle/Abmelden menu; 401/cancel banners
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/session-chip.test.tsx; session-banner.test.tsx"
        status: pass
    human_judgment: false
  - id: D4
    description: Higgsfield GPT Image 2 gate hero PNG at /login-gate-hero.png, not empty-state-hero.png
    requirement: AUTH-01
    verification:
      - kind: other
        ref: "file + python size assert + cmp vs empty-state-hero.png"
        status: pass
    human_judgment: true
    rationale: "File type/size/uniqueness are automated; visual fit to the locked navy folio/keyhole prompt needs a human look"
  - id: D5
    description: Phase 1 hash routes still green with signed-in fixture (five NAV_ITEMS, RE-2026-001)
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/routes.test.tsx#sidebar routes"
        status: pass
    human_judgment: false

duration: 17min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 04: Desktop Gate, Chip, Banners Summary

**Signed-out dark LoginGate + silent keychain boot, sidebar session chip with German primaryRole, 401/cancel banners, and a Higgsfield GPT Image 2 hero at `/login-gate-hero.png`**

## Performance

- **Duration:** 17 min
- **Started:** 2026-08-22T01:59:53Z
- **Completed:** 2026-08-22T02:17:02Z
- **Tasks:** 3
- **Files modified:** 22 source files (+ lockfile + PNG)

## Accomplishments

- Unsigned users see only the gate (h1 Clared, body Anmelden, um Rechnungen zu stellen., one Anmelden CTA). No sidebar, no invoice mock
- Keychain token boots to a full-viewport Spinner then AppShell on RE-2026-001; `/me` 401 is the gate; network/5xx is Phase 1 ErrorState with Erneut versuchen
- Sidebar footer chip shows name (email fallback) + German `primaryRole` badge; menu is Rolle + Abmelden only. Abmelden deletes this-device keychain session and opens the login window at `endSessionUrl`
- 401 banner `role=alert` keeps the shell and replays `lastRequest` after a new ticket; cancel banner `role=status`; network never opens the login window
- Gate hero is a real 2688×1520 PNG from Higgsfield GPT Image 2, not a copy of `empty-state-hero.png`

## Task Commits

Each task was committed atomically:

1. **Task 1 RED:** `f3aa045` (test) — failing LoginGate / SessionProvider specs
2. **Task 1 GREEN:** `5acc8dd` (feat) — LoginGate + SessionProvider wrap
3. **Task 2 RED:** `9c10940` (test) — failing chip / banner specs
4. **Task 2 GREEN:** `87762f1` (feat) — chip, mini-menu, banners, shadcn badge/dropdown
5. **Task 3:** `4013737` (feat) — Higgsfield login-gate-hero.png

**Plan metadata:** (docs commit after this file)

_Note: TDD tasks used RED then GREEN commits; no refactor commit._

## Files Created/Modified

- `apps/desktop/src/auth/login-gate.tsx` — full-viewport gate
- `apps/desktop/src/auth/session-provider.tsx` — boot / unsigned / signed / boot-error
- `apps/desktop/src/components/session-chip.tsx` — footer chip + Rolle/Abmelden
- `apps/desktop/src/components/session-banner.tsx` — 401 alert + cancel status
- `apps/desktop/src/App.tsx` — SessionProvider wrap; chip in nav `mt-auto`; banner above main
- `apps/desktop/src/auth/api.ts` — lastRequest slot, ApiError, replayLastRequest
- `apps/desktop/src-tauri/src/lib.rs` — optional `url` on `open_login_window`
- `packages/ui` — official Badge + DropdownMenu barrel exports
- `apps/desktop/public/login-gate-hero.png` — Higgsfield GPT Image 2 16:9 2k
- Desktop `__tests__` — unskipped Wave 0 auth specs; Phase 1 App tests wait for signed-in shell

## Decisions Made

- Chip and banner files live next to `error-state` under `components/`; Wave 0 tests now import that path
- `open_login_window` takes optional `url` so logout can load Authentik `end_session` without a second Tauri command
- Shared vitest Tauri/fetch doubles require `fileParallelism: false`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Phase 1 App tests wait for signed-in shell**
- **Found during:** Task 1 GREEN
- **Issue:** SessionProvider first paint is Spinner; sync `render(<App />)` no longer sees nav/RE-2026-001
- **Fix:** `waitFor` navigation in routes/invoice/screens/demo-states plus default keychain+/me doubles
- **Files modified:** `apps/desktop/src/__tests__/routes.test.tsx`, `invoice.test.tsx`, `screens.test.tsx`, `demo-states.test.tsx`, `setup.ts`, `auth-test-doubles.ts`
- **Verification:** `vitest run` 39 passed
- **Committed in:** `5acc8dd`

**2. [Rule 2 - Missing Critical] Optional url on open_login_window for end_session**
- **Found during:** Task 2
- **Issue:** 02-03 command always navigated to `/auth/login`; D-21 needs Authentik `end_session` after Abmelden
- **Fix:** `url: Option<String>` on the existing command; JS passes `endSessionUrl` from `logoutSession`
- **Files modified:** `apps/desktop/src-tauri/src/lib.rs`, `session-provider.tsx`
- **Verification:** desktop suite green; invoke still works with no args
- **Committed in:** `87762f1`

**3. [Rule 3 - Blocking] vitest fileParallelism disabled**
- **Found during:** Task 2 GREEN
- **Issue:** Parallel test files shared `fetchMock`/`tauriInvoke` and turned signed-in boot into ErrorState
- **Fix:** `fileParallelism: false` + `beforeEach(resetAuthMocks)`
- **Files modified:** `apps/desktop/vitest.config.ts`, `setup.ts`
- **Verification:** full desktop suite 39 passed
- **Committed in:** `87762f1`

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing critical)
**Impact on plan:** Required for correctness (D-21 logout, Phase 1 tests, isolated doubles). No extra product UI.

## Issues Encountered

- Official shadcn `badge`/`dropdown-menu` import `radix-ui` + `class-variance-authority`; added those to `@clared/ui` (planned registry components, not a substitute package)
- Radix dropdown in jsdom needed pointer-capture + ResizeObserver stubs and `pointerDown` to open the mini-menu

## Authentication Gates

Higgsfield CLI already had a signed-in starter-plan session (`higgsfield account status`). No human-action checkpoint.

## User Setup Required

None for this plan — Higgsfield session was already valid. Broader Phase 2 local Postgres/Redis setup remains in [02-USER-SETUP.md](./02-USER-SETUP.md).

## Next Phase Readiness

Ready for 02-05 (live Authentik in the login WebView). Desktop AUTH-01 chrome is in place against the 02-02 API and 02-03 commands. Human UAT still needs a Tauri launch: signed-out gate, Anmelden window 480×640, cancel banner, chip + Abmelden.

Plan-level verification: `pnpm --filter ./apps/desktop test` 39 passed; `login-gate-hero.png` is PNG 2688x1520, 5091779 bytes, `cmp` differs from `empty-state-hero.png`.

---
*Phase: 02-self-hosted-backend-authentik-sso*
*Completed: 2026-08-22*

## Self-Check: PASSED

