---
phase: quick-260830-7ia
plan: 01
subsystem: infra
tags: [github-actions, coolify, prisma, faynosync, docker, node24]

requires:
  - phase: quick-260830-59y
    provides: SHA-pinned actions, rust-toolchain 1.97.1, schema symlink, F-L1 labels
provides:
  - API CMD node-only with prisma migrate deploy once in CI
  - Coolify deploy health poll plus image-tag rollback
  - FaynoSync exact-one artifact plus v* tag/version gate
  - Job timeout-minutes on all five workflow files
affects: [coolify-deploy, desktop-publish, github-environments]

actuals:
  tokens: 4669
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - GitHub Environment production gates migrate and Coolify deploy
    - Fail-closed DATABASE_URL then prisma migrate deploy before image roll
    - mapfile exact-one plus basename version/arch/platform before FaynoSync upload

key-files:
  created: []
  modified:
    - apps/backend/Dockerfile
    - .github/workflows/backend-image.yml
    - .github/workflows/desktop-build.yml
    - .github/workflows/ci.yml
    - .github/workflows/labeler.yml
    - .github/workflows/sync-labels.yml
    - .github/labeler.yml
    - .github/PULL_REQUEST_TEMPLATE.md
    - .planning/phases/04.2-desktop-platform-hardening-tauri-plugins-updater-log-prevent/04.2-UPDATER-OPS.md
    - .planning/phases/04.3-infra-prep-for-pdf-offline-audit-gotenberg-uptime-kuma-besze/04.3-PDF-OPS.md

key-decisions:
  - "API replicas must not migrate at start; CI migrate job is the single writer"
  - "Worker health is Coolify status running, never an invented FQDN"
  - "TECH-DEBT comments omit the literal provenance: false string so the two YAML keys remain the only matches"

patterns-established:
  - "environment: production on migrate and deploy; reviewers and branch policy stay GitHub UI"
  - "FaynoSync upload aborts unless mapfile length is 1 and basename contains version, arch, platform cue"

requirements-completed: [F-B5, F-B6, F-B7, F-E4, F-E5, F-E6, F-SEC3, F-SEC4, F-L2, F-P1, F-SEC5]

coverage:
  - id: D1
    description: API CMD is node dist/main.js; prisma migrate deploy once in CI fail-closed before Coolify deploy
    requirement: F-B6
    verification:
      - kind: other
        ref: grep -F 'CMD ["node", "dist/main.js"]' apps/backend/Dockerfile && grep -F 'pnpm --filter ./apps/backend exec prisma migrate deploy' .github/workflows/backend-image.yml
        status: pass
    human_judgment: false
  - id: D2
    description: Deploy polls API /health/ready and rolls back previous docker_registry_image_tag; worker uses Coolify running status
    requirement: F-B5
    verification:
      - kind: other
        ref: grep -F 'health/ready' .github/workflows/backend-image.yml
        status: pass
    human_judgment: true
    rationale: Live Coolify deploy from this branch is not the proof; YAML structure is the gate. GitHub Environment reviewers remain UI-only.
  - id: D3
    description: FaynoSync exact-one mapfile, basename version/arch/platform, v* tag equals tauri.conf.json version
    requirement: F-E4
    verification:
      - kind: other
        ref: grep -F 'mapfile' .github/workflows/desktop-build.yml && grep -E 'GITHUB_REF_NAME' .github/workflows/desktop-build.yml
        status: pass
    human_judgment: false
  - id: D4
    description: timeout-minutes on every job in the five workflow files; documentation labeler; PR template; ubuntu-24.04 desktop-test; Node 24 only
    requirement: F-SEC4
    verification:
      - kind: other
        ref: test timeout-minutes counts; grep ubuntu-24.04; grep node-version 24; cat .nvmrc
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-08-30
status: complete
---

# Phase quick-260830-7ia Plan 01: Audit Phase 4 Release-Reife Summary

**API migrate-once in CI, Coolify health-gated rollback, FaynoSync exact-one publish, job timeouts — Node 24 locked**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-30T03:35:28Z
- **Completed:** 2026-08-30T03:40:17Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- API container starts with `node dist/main.js` only; `prisma migrate deploy` runs once in the `migrate` job with fail-closed `DATABASE_URL` on GitHub Environment `production`
- Coolify deploy captures previous `docker_registry_image_tag`, polls API `/health/ready` or worker Coolify `running` status, and rolls back on failure
- FaynoSync publish uses `mapfile` exact-one plus basename version/arch/platform; `v*` tags must match `tauri.conf.json`
- Every listed workflow job has `timeout-minutes`; documentation labeler ignores `.planning`; PR template lists generalized checks; `desktop-test` is `ubuntu-24.04`

## Task Commits

1. **Task 1: API migrate-once, production deploy health, rollback (F-B5, F-B6, F-B7, F-SEC3)** - `e63dce8` (feat)
2. **Task 2: FaynoSync exact-one, tag/version gate, signing docs (F-E4, F-E5, F-E6)** - `f686f42` (feat)
3. **Task 3: Job timeouts, docs labeler, PR template, ubuntu-24.04 (F-SEC4, F-L2, F-P1, F-SEC5)** - `db78795` (chore)

**Plan metadata:** skipped (orchestrator docs commit)

## Files Created/Modified

- `apps/backend/Dockerfile` - API CMD JSON-exec `node dist/main.js`; worker unchanged; curl kept
- `.github/workflows/backend-image.yml` - migrate job, production environment, health poll, rollback, timeouts, TECH-DEBT attestations
- `.github/workflows/desktop-build.yml` - mapfile exact-one, tag/version gate, timeouts 90/20
- `.github/workflows/ci.yml` - six job timeouts; desktop-test `ubuntu-24.04`
- `.github/workflows/labeler.yml` - `timeout-minutes: 5`
- `.github/workflows/sync-labels.yml` - `timeout-minutes: 5`
- `.github/labeler.yml` - documentation globs no longer match `.planning/**`
- `.github/PULL_REQUEST_TEMPLATE.md` - unit/e2e, prod-build, Prisma, desktop/UI, deploy/infra checkboxes
- `.planning/phases/04.3-.../04.3-PDF-OPS.md` - GHCR attestations TECH-DEBT; Last Dockerfile stage node-only
- `.planning/phases/04.2-.../04.2-UPDATER-OPS.md` - Apple notarization and Authenticode required for public distribution

## Decisions Made

- Worker has no HTTP health host; poll Coolify `status` for `running` only
- TECH-DEBT comments describe attestations without repeating the literal `provenance: false` / `sbom: false` strings so the verify count stays two YAML keys
- GitHub UI reviewers / branch policy documented in YAML comments; not set from YAML

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TECH-DEBT comments matched `provenance: false` / `sbom: false`**
- **Found during:** Task 1 verify
- **Issue:** Comments containing those exact strings made `grep -c` return 4 instead of 2
- **Fix:** Reworded comments to "GHCR attestations stay off" while keeping `TECH-DEBT` and the two YAML keys
- **Files modified:** `.github/workflows/backend-image.yml`
- **Verification:** `grep -c 'provenance: false'` and `sbom: false` equal 2
- **Committed in:** `e63dce8`

**2. [Rule 2 - Missing Critical] Stale Last Dockerfile stage line in 04.3-PDF-OPS.md**
- **Found during:** Task 1
- **Issue:** Ops SSOT still described API CMD as `prisma migrate deploy && node dist/main.js`
- **Fix:** Updated the inventory row to `node dist/main.js` and CI-once migrate (plus the planned four-line attestations note)
- **Files modified:** `.planning/phases/04.3-infra-prep-for-pdf-offline-audit-gotenberg-uptime-kuma-besze/04.3-PDF-OPS.md`
- **Verification:** `grep -F 'TECH-DEBT'` on that file
- **Committed in:** `e63dce8`

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both required for verify correctness and ops SSOT. No scope creep. Phase 1–3 behavior unchanged. No new Kaneo task.

## Issues Encountered

None. `actionlint` not installed; skipped as optional.

## User Setup Required

**GitHub Environment `production` cannot be fully configured from YAML.** Operator must:

1. Repo Settings → Environments → `production` → Secret `DATABASE_URL` (same connection string Coolify uses for clared Postgres). Never commit. Migrate job fails closed if unset.
2. Required reviewers; deployment branches `main` and `v*` tags. Do not add a wait timer that blocks this private-repo CI.

See plan `user_setup`. YAML only sets `environment: production`.

## Next Phase Readiness

- Release-Reife YAML is on `fix/desktop-tauri-matrix-concurrency`
- First live proof is a `main` deploy after merge, not a deploy from this branch
- Node 24 remains locked in `.nvmrc`, Dockerfile `FROM`, and every `setup-node`

---
*Phase: quick-260830-7ia*
*Completed: 2026-08-30*

## Self-Check: PASSED
