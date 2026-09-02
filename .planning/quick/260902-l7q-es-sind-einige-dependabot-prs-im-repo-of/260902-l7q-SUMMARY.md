---
phase: quick-260902-l7q
plan: 01
subsystem: deps
tags: [nestjs, jest, dependabot, github-actions, pnpm, node24]

requires:
  - phase: main
    provides: Nest 11 backend + SHA-pinned workflows + Node 24 lock
provides:
  - Nest 12 lockstep in apps/backend (common/core/platform-express/testing 12.0.1, swagger/cli 12.0.0, terminus 12.0.0)
  - Jest CJS transform of @nestjs ESM including import.meta.url rewrite
  - pnpm/action-setup SHA 0977fd99725f1db4007ccb2928dbb4e90d06cc86 on six uses
affects: [backend-unit, backend-e2e, ci, desktop-build, backend-image]

actuals:
  tokens: 26086
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns:
    - Nest 12 lockstep (all official @nestjs packages + terminus together)
    - Jest transformIgnorePatterns allow .pnpm and @nestjs/; ts-jest wrapper rewrites import.meta.url

key-files:
  created:
    - apps/backend/jest-ts-nestjs.cjs
  modified:
    - apps/backend/package.json
    - pnpm-lock.yaml
    - apps/backend/jest.config.cjs
    - apps/backend/test/jest-e2e.json
    - .github/workflows/ci.yml
    - .github/workflows/desktop-build.yml
    - .github/workflows/backend-image.yml

key-decisions:
  - "nestjs-pino bumped ^4.6.1 → ^5.0.0 so peers include @nestjs/common 12 (4.x stops at 11)"
  - "Jest stays CJS + transformIgnorePatterns; custom ts-jest wrapper rewrites import.meta.url instead of type:module or Vitest"
  - "Dependabot PRs #79–#85 left open; executor did not merge/close/ignore (D-05)"

patterns-established:
  - "Nest major upgrades land lockstep with terminus + any peer-unmeetable already-installed package"
  - "pnpm/action-setup stays 40-char SHA plus # v6.0.10 comment"

requirements-completed: [DEP-79, DEP-80, DEP-81, DEP-82, DEP-83, DEP-84, DEP-85, NODE-24]

coverage:
  - id: D1
    description: Nest 12.0.1/12.0.0 versions from #79–#84 plus terminus 12.0.0 compile and pass backend unit tests
    requirement: DEP-83
    verification:
      - kind: unit
        ref: "pnpm --filter ./apps/backend test (6 suites / 32 tests, including permissions.guard.spec.ts)"
        status: pass
      - kind: other
        ref: "pnpm --filter ./apps/backend exec nest build"
        status: pass
    human_judgment: false
  - id: D2
    description: Jest transforms @nestjs ESM under CJS (transformIgnorePatterns + import.meta.url rewrite)
    requirement: DEP-83
    verification:
      - kind: unit
        ref: "apps/backend/src/auth/permissions.guard.spec.ts — 4 tests pass after SyntaxError RED"
        status: pass
    human_judgment: false
  - id: D3
    description: Six pnpm/action-setup uses pin SHA 0977fd99… with v6.0.10 comment
    requirement: DEP-85
    verification:
      - kind: other
        ref: "grep -cE pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86 .github/workflows/*.yml == 6"
        status: pass
    human_judgment: false
  - id: D4
    description: Runtime Node pin stays 24 in .nvmrc, Dockerfile, and workflow node-version
    requirement: NODE-24
    verification:
      - kind: other
        ref: "cat .nvmrc == 24; FROM node:24-bookworm-slim; node-version: 24 count >= 5; dependabot ignore node >=25"
        status: pass
    human_judgment: false
  - id: D5
    description: Dependabot PRs stay open; executor does not merge or dismiss them
    requirement: DEP-85
    verification: []
    human_judgment: true
    rationale: "D-05 is a process constraint (no gh pr merge/close). Orchestrator push/PR/CI/merge after this summary; Dependabot PRs close as superseded on main."

duration: 9min
completed: 2026-09-02
status: complete
---

# Phase quick-260902-l7q Plan 01: Dependabot Nest 12 + action-setup Summary

**Nest 12 lockstep (six Dependabot versions + terminus 12.0.0) with Jest CJS transform of @nestjs ESM, plus pnpm/action-setup SHA 0977fd99… ×6; Node 24 unchanged**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-02T13:26:56Z
- **Completed:** 2026-09-02T13:35:58Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- All six Dependabot Nest packages plus `@nestjs/terminus` 12.0.0 pinned together; `nestjs-pino` ^5.0.0 so peers include common 12
- Unit Jest `transformIgnorePatterns` allows `.pnpm` and `@nestjs/`; `jest-ts-nestjs.cjs` rewrites leftover `import.meta.url` after ts-jest CJS emit
- `permissions.guard.spec.ts` (4) and full backend unit suite (6 suites / 32 tests) pass; `nest build` succeeds; backend stays CommonJS (no `type` field)
- Six `pnpm/action-setup` uses pin `0977fd99725f1db4007ccb2928dbb4e90d06cc86` with `# v6.0.10`; Node 24 lock intact
- Dependabot PRs #79–#85 left open (D-05)

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Nest 12 lockstep versions** - `d453a68` (test)
2. **Task 1 GREEN: Jest ESM transform** - `6faff91` (feat)
3. **Task 2: Pin pnpm/action-setup SHA** - `4d9dd25` (chore)

_Note: TDD tracer produced RED then GREEN commits. Docs metadata commit is orchestrator-owned._

## Files Created/Modified

- `apps/backend/package.json` - Nest 12.0.1/12.0.0 pins, terminus 12.0.0, nestjs-pino ^5.0.0
- `pnpm-lock.yaml` - resolved Nest 12 tree
- `apps/backend/jest.config.cjs` - transformIgnorePatterns, allowJs, reflect-metadata setupFiles, custom transformer
- `apps/backend/test/jest-e2e.json` - broaden @nestjs allow; same transformer
- `apps/backend/jest-ts-nestjs.cjs` - ts-jest wrapper rewriting `import.meta.url`
- `.github/workflows/ci.yml` - four action-setup SHA pins
- `.github/workflows/desktop-build.yml` - one action-setup SHA pin
- `.github/workflows/backend-image.yml` - one action-setup SHA pin

## Decisions Made

- Bump `nestjs-pino` to ^5.0.0 (first line that peers `@nestjs/common` ^11.0.8 || ^12.0.0). Plan allowed bumping an already-installed package to accept common 12; 4.6.1 peers stop at 11.
- Keep Jest CJS. `transformIgnorePatterns` alone left `import.meta.url` as SyntaxError after ts-jest emit. Wrapper rewrites to `require("url").pathToFileURL(__filename).href`. No `type: module`, no Vitest, no `nest upgrade`.
- Catch-all stays `@All("{*path}")`. No unnamed wildcards found.
- D-05: no `gh pr merge` / close / dependabot ignore.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] nestjs-pino peer range**
- **Found during:** Task 1 (RED install)
- **Issue:** `nestjs-pino@4.6.1` unmet peer `@nestjs/common` (wanted ^8–11, installed 12.0.1)
- **Fix:** Bump to `^5.0.0` (5.0.0 is first that accepts common 12). `LoggerModule.forRoot` / `Logger` call sites unchanged.
- **Files modified:** `apps/backend/package.json`, `pnpm-lock.yaml`
- **Verification:** `pnpm peers check` — no issues
- **Committed in:** `d453a68` (Task 1 RED)

**2. [Rule 1 - Bug] Nest 12 `import.meta.url` after ts-jest CJS emit**
- **Found during:** Task 1 GREEN
- **Issue:** After `transformIgnorePatterns` allowed @nestjs, Jest parsed transformed `load-package.util.js` and threw `SyntaxError: Cannot use 'import.meta' outside a module`
- **Fix:** `apps/backend/jest-ts-nestjs.cjs` wraps ts-jest and rewrites `import.meta.url`. Unit + e2e configs point at it.
- **Files modified:** `apps/backend/jest-ts-nestjs.cjs`, `apps/backend/jest.config.cjs`, `apps/backend/test/jest-e2e.json`
- **Verification:** `permissions.guard.spec.ts` 4/4; full unit 32/32
- **Committed in:** `6faff91` (Task 1 GREEN)

---

**Total deviations:** 2 auto-fixed (1 blocking peer, 1 Jest import.meta)
**Impact on plan:** Both required for Nest 12 lockstep to install and for unit tests to go green. No scope creep.

## TDD Gate Compliance

- RED: `d453a68` — Nest 12 versions + lockfile; `permissions.guard.spec.ts` failed with `Cannot use import statement outside a module`
- GREEN: `6faff91` — Jest transform; same spec and full unit suite pass

## Issues Encountered

- zsh `grep -c` on a glob prints per-file counts, so `test "$(grep -cE … *.yml)" -eq 6` is not an integer. Counted with `grep -h … | wc -l` instead (result 6).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Orchestrator: push `quick/260902-l7q-dependabot`, open one PR covering Nest 12 lockstep + action-setup SHA, watch CI (lint/backend-unit/backend-e2e/desktop-test/ci), fix if needed, merge.
- After merge, confirm Dependabot #79–#85 close as superseded (not dismissed).
- Kaneo `w1yf1hjj09dvc4nn19ve20fi` stays in-progress until that merge.

## Self-Check: PASSED

- FOUND: `apps/backend/package.json` Nest 12 pins + terminus 12.0.0
- FOUND: `apps/backend/jest.config.cjs` transformIgnorePatterns
- FOUND: `apps/backend/jest-ts-nestjs.cjs`
- FOUND: commits `d453a68`, `6faff91`, `4d9dd25`
- FOUND: `.nvmrc` = 24; Dockerfile `node:24-bookworm-slim`; six action-setup SHA uses
---
*Phase: quick-260902-l7q*
*Completed: 2026-09-02*
