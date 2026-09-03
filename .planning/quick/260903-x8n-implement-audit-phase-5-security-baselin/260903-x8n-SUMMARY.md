---
status: complete
phase: quick-260903-x8n
plan: 01
subsystem: ci
tags: [github-actions, zizmor, gitleaks, trivy, codeql, harden-runner, node24]

requires:
  - phase: main
    provides: SHA-pinned checkout/setup-node/pnpm-action-setup, Node 24 lock, backend-image dual GHCR tags
provides:
  - zizmor.yml on push/PR with empty workflow permissions and persist-credentials false
  - gitleaks.yml full-history scan with GITHUB_TOKEN only
  - codeql.yml javascript-typescript + rust matrix, weekly cron, shared codeql-action SHA
  - Trivy HIGH,CRITICAL image scans after both GHCR pushes
  - Harden Runner egress-policy audit as first uses of eleven listed jobs
affects: [ci, backend-image, desktop-build, github-security-tab]

actuals:
  tokens: 4963
  tasks: 3
  commits: 3

tech-stack:
  added:
    - zizmorcore/zizmor-action@6fc4b006235f201fdab3722e17240ab420d580e5
    - gitleaks/gitleaks-action@e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e
    - aquasecurity/trivy-action@ed142fd0673e97e23eac54620cfb913e5ce36c25
    - step-security/harden-runner@e14015d583714f6e62063499dc959a02595150a1
    - github/codeql-action@cdf488f595d80d6e07e03d4674febd5ab45fa938
  patterns:
    - New scan workflows start with permissions: {} and persist-credentials: false
    - SHA-pin 40-char then space hash then version comment
    - Harden Runner audit is first uses of ci / backend-image / desktop-build jobs only

key-files:
  created:
    - .github/workflows/zizmor.yml
    - .github/workflows/gitleaks.yml
    - .github/workflows/codeql.yml
    - docs/claredtool-phasenplan.md
  modified:
    - .github/workflows/backend-image.yml
    - .github/workflows/ci.yml
    - .github/workflows/desktop-build.yml

key-decisions:
  - "Harden Runner stays egress-policy audit; no deny-unlisted allowlist this phase (D-08)"
  - "No GITLEAKS_LICENSE; public-repo gitleaks-action uses GITHUB_TOKEN only (D-07)"
  - "CodeQL advanced setup is codeql.yml, not GitHub UI default setup (D-02)"
  - "No .zizmor.yml or .trivyignore — local docker daemon was down so no preemptive ignore file"

patterns-established:
  - "New GitHub Actions jobs: timeout-minutes plus least-privilege job permissions under workflow permissions: {}"
  - "Trivy runs only after both docker/build-push-action steps, API sha tag then sha-tag-worker"

requirements-completed: [G1, G2, G3, G6, AUDIT-5, AUDIT-5b, NODE-24]

coverage:
  - id: D1
    description: zizmor.yml scans Actions YAML on push to main and pull_request with pinned zizmor-action
    requirement: G1
    verification:
      - kind: other
        ref: "test -f .github/workflows/zizmor.yml && grep pinned zizmor-action SHA && python3 yaml.safe_load"
        status: pass
    human_judgment: false
  - id: D2
    description: gitleaks.yml full-history scan with fetch-depth 0 and GITHUB_TOKEN only
    requirement: G3
    verification:
      - kind: other
        ref: "grep fetch-depth 0, GITHUB_TOKEN, and ! GITLEAKS_LICENSE in gitleaks.yml"
        status: pass
    human_judgment: false
  - id: D3
    description: codeql.yml analyzes javascript-typescript and rust with shared SHA and weekly cron
    requirement: G6
    verification:
      - kind: other
        ref: "grep init/autobuild/analyze @cdf488f595d80d6e07e03d4674febd5ab45fa938 and fail-fast false"
        status: pass
    human_judgment: false
  - id: D4
    description: Trivy scans API sha tag and worker -worker tag after both build-push steps
    requirement: G2
    verification:
      - kind: other
        ref: "grep -c trivy-action SHA == 2 and python order check max(build-push) < min(trivy)"
        status: pass
    human_judgment: false
  - id: D5
    description: Harden Runner audit is first uses of all eleven listed jobs; Node 24 and pnpm/action-setup SHA unchanged
    requirement: AUDIT-5b
    verification:
      - kind: other
        ref: "python first-uses pin check (6/3/2) plus grep node-version 24 and pnpm/action-setup SHA"
        status: pass
    human_judgment: false
  - id: D6
    description: First-run GitHub Security-tab triage for zizmor, gitleaks, Trivy, and CodeQL alerts
    requirement: AUDIT-5
    verification: []
    human_judgment: true
    rationale: "D-10 leftover — YAML cannot mark alerts false-positive; GitHub UI Security tab only"

duration: 5min
completed: 2026-09-03
status: complete
---

# Phase quick-260903-x8n Plan 01: Audit Phase 5 Security Baseline Summary

**SHA-pinned zizmor, gitleaks, and CodeQL workflows plus Trivy on both GHCR images and Harden Runner audit on eleven jobs, Node 24 unchanged**

## Performance

- **Duration:** 5 min
- **Started:** 2026-09-03T22:08:25Z
- **Completed:** 2026-09-03T22:13:13Z
- **Tasks:** 3
- **Files modified:** 7
- **Commits:** 3 (task commits only; docs commit is orchestrator)

## Accomplishments

- PRs and `main` get a zizmor workflow-audit job (empty top-level permissions, persist-credentials false)
- Full git history is scanned by gitleaks with `GITHUB_TOKEN` only
- CodeQL covers `javascript-typescript` and `rust` on `main` plus weekly Monday 05:18 UTC cron
- Both GHCR tags (`sha-<7>` and `sha-<7>-worker`) are Trivy-scanned after both image pushes; HIGH/CRITICAL with a fix fail the job
- Eleven jobs in `ci.yml`, `backend-image.yml`, and `desktop-build.yml` start with Harden Runner `egress-policy: audit`
- `docs/claredtool-phasenplan.md` is tracked; product ROADMAP Phase 05 was not edited

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end zizmor workflow** - `47f1545` (feat)
2. **Task 2: gitleaks.yml, codeql.yml, track phasenplan** - `a540522` (feat)
3. **Task 3: Trivy both images plus Harden-Runner first step** - `17ab691` (feat)

**Plan metadata:** `4e26f1c` (already on branch; docs SUMMARY commit is orchestrator)

_Note: Task 3 is `tdd="true"` but YAML-only — RED was the plan verify (failed before patch); no separate `test(...)` commit. See TDD Gate Compliance._

## Files Created/Modified

- `.github/workflows/zizmor.yml` - G1 workflow audit on push/PR
- `.github/workflows/gitleaks.yml` - G3 full-history secret scan
- `.github/workflows/codeql.yml` - G6 JS/TS + Rust analysis
- `docs/claredtool-phasenplan.md` - audit source tracked as-is
- `.github/workflows/backend-image.yml` - Harden Runner on build/migrate/deploy; two Trivy steps after both build-push
- `.github/workflows/ci.yml` - Harden Runner first step on changes/lint/desktop-test/backend-unit/backend-e2e/ci
- `.github/workflows/desktop-build.yml` - Harden Runner first step on tauri/publish-faynosync

## Decisions Made

- Harden Runner stays `egress-policy: audit` — no allowlist, no `block` (D-08)
- No `GITLEAKS_LICENSE` env (D-07)
- CodeQL is advanced setup via `codeql.yml`; do not turn on GitHub UI default setup (D-02)
- No `.zizmor.yml` / `.trivyignore` — prefer fix; local docker daemon was down so no pre-scan
- Node 24 and `pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86` left byte-identical (D-01)

## Deviations from Plan

### Auto-fixed Issues

None - implementation matched the plan YAML.

### Verify / TDD notes (non-code)

**1. [Rule 3 - Blocking] Multi-file `grep -c … -eq 11` is not an integer on this grep**

- **Found during:** Task 3 verify
- **Issue:** `grep -c pattern file1 file2 file3` prints per-file counts (`ci.yml:6` / `backend-image.yml:3` / `desktop-build.yml:2`), so `test "$(…)" -eq 11` errors with `integer expression expected`
- **Fix:** Did not change workflows. Confirmed equivalent sum is 11 via python `count('egress-policy: audit')`. Remainder of the verify chain (first-uses python, Node 24, pnpm SHA, yaml.safe_load) passed
- **Files modified:** none
- **Verification:** egress_sum 11; first_uses_ok; yaml_ok
- **Committed in:** n/a (verify command quirk, not a workflow change)

**2. [Rule 3 - Blocking] Local zizmor/Trivy scan skipped — Docker daemon not running**

- **Found during:** Task 3 post-YAML scan
- **Issue:** `docker` CLI exists but daemon socket `unix:///Users/puzzless/.orbstack/run/docker.sock` is down; `zizmor` and `actionlint` not on PATH
- **Fix:** No `.zizmor.yml` suppressions. No `.trivyignore`. First CI Trivy/CodeQL/zizmor run may still go red; fix vulns or add CVE+reason ignore then, never bump Node major
- **Files modified:** none
- **Verification:** `docker run ghcr.io/zizmorcore/zizmor` failed to connect
- **Committed in:** n/a

---

**Total deviations:** 2 notes (0 workflow auto-fixes)
**Impact on plan:** YAML matches pins. First-run scanner triage stays D-10 human leftover.

## TDD Gate Compliance

Task 3 frontmatter is `tdd="true"` (YAML structural behavior). RED: plan `<verify>` failed before patches (`trivy-action` count 0, harden-runner count 0). GREEN: `17ab691`. No `test(...)` commit — plan `<files>` are the three workflows only; `/scripts/` is gitignored. Verify python in the plan is the runnable check.

## Issues Encountered

- BSD/GNU `grep -c` with multiple files cannot satisfy `test -eq 11` as written in the plan verify block
- OrbStack Docker daemon was not running, so no local zizmor or Trivy base-image scan

## User Setup Required

**GitHub Security tab (D-10) — first-run alert triage is UI only.** After the first workflow runs:

1. Open GitHub → Security (code scanning + secret scanning). Not Settings → Code security → default setup
2. Triage zizmor, gitleaks, Trivy, and CodeQL alerts (fix vs accept)
3. Do not enable CodeQL default setup — `codeql.yml` is the setup (D-02)

## Next Phase Readiness

- Audit Phase 5 + 5b YAML is on `quick/260903-x8n-audit-phase-5`
- Ready for PR; first CI run of zizmor/gitleaks/CodeQL/Trivy may need alert triage or a CVE `.trivyignore`
- Deferred: Phase 6 Squawk/SBOM/cosign; Phase 7 N1-Rest/W2/W1/N4; F-B6/B7/E6/SEC3
- Product Phase 05 (PDF/Offline/Audit) untouched

---
*Phase: quick-260903-x8n*
*Completed: 2026-09-03*

## Self-Check: PASSED

- FOUND: `.github/workflows/zizmor.yml`
- FOUND: `.github/workflows/gitleaks.yml`
- FOUND: `.github/workflows/codeql.yml`
- FOUND: `.github/workflows/backend-image.yml`
- FOUND: `.github/workflows/ci.yml`
- FOUND: `.github/workflows/desktop-build.yml`
- FOUND: `docs/claredtool-phasenplan.md`
- FOUND: `47f1545`
- FOUND: `a540522`
- FOUND: `17ab691`
