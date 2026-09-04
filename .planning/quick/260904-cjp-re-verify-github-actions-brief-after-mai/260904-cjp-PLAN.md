---
phase: quick-260904-cjp
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .github/workflows/codeql.yml
  - .github/workflows/ci.yml
  - .github/workflows/desktop-build.yml
autonomous: true
requirements:
  - D-02
  - D-03
  - D-04
estimate:
  tokens: 22000
  raw_tokens: 22000
  tasks: 3
  confidence: low
must_haves:
  truths:
    - "CodeQL analyze-rust does not run on pull_request; it still runs on push to main when rust paths match, on schedule cron 18 5 * * 1, and on workflow_dispatch (D-02, D-03)."
    - "CodeQL analyze-js-typescript still runs on non-draft pull_request when JS/TS paths match (D-03)."
    - "ci.yml runs backend-unit (timeout-minutes 15, no postgres/redis) and backend-e2e (timeout-minutes 20, same Postgres 16 and Redis 7 digests as today) in parallel with the same path/draft if; aggregator job id stays ci and checks both (D-01 aggregator name, D-02)."
    - "desktop-build.yml tauri matrix is windows-2025 and macos-26; comment documents the 2026-09 pin that overrides 04.4 D-17 windows-2022/macos-15 (D-04)."
    - "Signed desktop job still has package-manager-cache false; ci.yml desktop-rust still uses the existing cargo cache action (D-02, 04.4 D-04)."
    - "gitleaks.yml, zizmor.yml, and backend-image.yml are byte-unchanged (D-01, D-03)."
  artifacts:
    - .github/workflows/codeql.yml
    - .github/workflows/ci.yml
    - .github/workflows/desktop-build.yml
  key_links:
    - "codeql.yml analyze-rust if excludes pull_request; detect forces rust=false on pull_request"
    - "ci.yml aggregator needs backend-unit and backend-e2e; skipped still OK"
    - "desktop-build.yml matrix.os windows-2025 + macos-26; setup-node package-manager-cache false"
  prohibitions:
    - statement: "Do not re-implement merged 04.4 path filters, draft gating, SHA pins, or founder GitHub Settings (D-09, D-12)."
      status: unverified
    - statement: "Do not add a cargo registry cache step to CodeQL analyze-rust (D-02)."
      status: unverified
    - statement: "Do not add Actions cache, cargo cache, or setup-node package-manager-cache to desktop-build.yml (D-02, 04.4 D-04, zizmor G1)."
      status: unverified
    - statement: "Do not add a third-party duplicate-run skipper (D-03)."
      status: unverified
    - statement: "Do not use windows-latest, macos-latest, macos-26-xlarge, or windows-2025-vs2026 (D-04)."
      status: unverified
    - statement: "Do not add pull_request_target or workflow_run deploy (04.4 D-02)."
      status: unverified
    - statement: "Do not rename the aggregator job away from ci (04.4 D-01)."
      status: unverified
    - statement: "Do not edit gitleaks.yml, zizmor.yml, or backend-image.yml (D-01, D-03)."
      status: unverified
    - statement: "Do not add a new npm/pip/cargo dependency or a new third-party Action (D-03)."
      status: unverified
---

<objective>
Speed remaining GitHub Actions after merged 04.4 (PR #101): drop CodeQL Rust from pull_request (D-02, D-03), split sequential backend tests into parallel unit vs e2e (D-02), pin desktop runners to windows-2025 and macos-26 (D-04). Do not redo 04.4 (D-01).

Purpose: Cut PR wall clock (Rust CodeQL ~8.5 min, backend-test ~6.5 min sequential) and Windows/macOS signed-build time via newer hosted images, without cache-poisoning the signed updater path.

Output: codeql.yml trigger/if change; ci.yml backend-unit + backend-e2e + aggregator; desktop-build.yml runner labels. No new Actions. No GitHub Settings.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.github/workflows/codeql.yml
@.github/workflows/ci.yml
@.github/workflows/desktop-build.yml
@.github/actions/setup-pnpm-ci/action.yml
@.agents/skills/gha-security-review/SKILL.md

04.4 already merged (PR #101). Live 2026-09-04: path filters work; desktop-build is tags + workflow_dispatch only; backend-image is push-only. Remaining gaps are SPEED + TRIGGERS + RUNNER LABELS (D-01).

Keep: ci.yml tests on PR and push main; gitleaks on both; zizmor path-filtered on both; labeler PR-only; backend-image / desktop-build not on PR (D-03).

SHA pins and Harden-Runner first steps stay. setup-pnpm-ci stays on unsigned CI (cache pnpm). desktop-rust already has swatinem/rust-cache@6323deb102c322ba6fcbdcafc7e3dddab59af2b6 — leave it. Signed tauri job must keep package-manager-cache: false (04.4 D-04, zizmor G1, PRs #95 #96).

Aggregator job id stays exactly `ci` (04.4 D-01).

No Kaneo. CI YAML only. User-facing plan English.
</context>

<tasks>

<task type="tracer">
  <name>End-to-end CodeQL Rust off pull_request — JS stays</name>
  <files>.github/workflows/codeql.yml</files>
  <read_first>.github/workflows/codeql.yml</read_first>
  <action>
    Per D-02 and D-03: CodeQL Rust leaves pull_request. JS/TS CodeQL stays on non-draft PRs (measured ~1.5 min).

    On the pull_request.paths list only, remove the Rust globs (*.rs, Cargo.toml, Cargo.lock, rust-toolchain.toml). Leave those four globs on push.paths so main still path-filters Rust. Leave .github/workflows/codeql.yml on both push and pull_request. Do not add workflow-level paths that would skip the whole workflow on docs-only in a pending-check way — this file already uses per-event paths plus detect.

    In job detect, step set: when github.event_name is pull_request, write rust=false to GITHUB_OUTPUT even if the rust filter matched (workflow-YAML-only PRs). Keep schedule and workflow_dispatch forcing both languages true. Keep push using the filter outputs.

    Change job analyze-rust if to require needs.detect.outputs.rust == true AND github.event_name != pull_request. Keep timeout-minutes 45, ubuntu-latest, build-mode none, existing codeql-action SHA cdf488f595d80d6e07e03d4674febd5ab45fa938. Do not add a cargo registry cache step (build-mode none; extra poisoning risk on a security job) (D-02).

    Leave analyze-js-typescript if unchanged (language output plus draft skip). Leave schedule cron 18 5 * * 1 and workflow_dispatch. Leave concurrency and permissions. Do not add a third-party duplicate-run skipper (D-03). Do not touch other workflow files in this task.
  </action>
  <verify>
    <automated>python3 -c 'import yaml; w=yaml.safe_load(open(".github/workflows/codeql.yml")); pr=w["on"]["pull_request"]["paths"]; push=w["on"]["push"]["paths"]; rustish=lambda p: str(p).endswith(".rs") or "Cargo" in str(p) or "rust-toolchain" in str(p); assert not any(rustish(p) for p in pr), pr; assert any(str(p).endswith(".rs") for p in push); ar=w["jobs"]["analyze-rust"]["if"]; assert "pull_request" in ar and "!=" in ar; aj=w["jobs"]["analyze-js-typescript"]["if"]; assert "pull_request" in aj and "draft" in aj; print("codeql ok")'</automated>
  </verify>
  <done>Rust-only PRs do not queue analyze-rust; JS/TS PRs still get analyze-js-typescript; push main + schedule + dispatch still run Rust when detect says so (D-02, D-03).</done>
</task>

<task type="auto">
  <name>Split backend unit vs e2e into parallel jobs</name>
  <files>.github/workflows/ci.yml</files>
  <read_first>.github/workflows/ci.yml (consolidated backend job with timeout-minutes 30, squawk job, aggregator job ci)</read_first>
  <action>
    Per D-02: measured PR #103 backend job was ~6.5 min sequential nest build + unit jest + tax-engine jest + e2e. Split into two parallel jobs sharing the same needs: changes and the same if as today (non-draft PR or push, and backend or shared or tax-engine outputs).

    Job backend-unit: timeout-minutes 15. No services block (origin 260828-5c8: only e2e starts postgres/redis). Same Harden Runner SHA, checkout persist-credentials false, uses ./.github/actions/setup-pnpm-ci, same frozen filtered install (--filter @clared/tax-engine... --filter ./apps/backend...). Keep tax-engine build, prisma generate, prisma validate, nest build, then backend exec jest with default plus github-actions reporters, then tax-engine exec jest with the same reporters. Keep the pnpm 11 exec (not run) flag pass-through. Do not add a Jest disk cache.

    Job backend-e2e: timeout-minutes 20. Copy the current postgres:16-alpine@sha256:cf78e76683b9ca8c5733cbbdce6c9262b45b6767934dd0a95e671f9a0fc20685 and redis:7-alpine@sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf services, health options, POSTGRES_* env, ports, DATABASE_URL, REDIS_URL verbatim — do not bump 16/7. Same setup-pnpm-ci and frozen filtered install. Steps: tax-engine build, prisma generate, prisma migrate deploy, then exec jest --config ./test/jest-e2e.json with the same reporters. Skip nest build and prisma validate here (unit job already compiles). Skip tax-engine unit jest here.

    Delete the consolidated timeout-30 backend job. Update aggregator job ci needs to [changes, desktop-web, desktop-rust, backend-unit, backend-e2e, squawk]. Update GITHUB_STEP_SUMMARY lines and check() calls for both new result env vars. skipped remains OK; failure and cancelled still fail. Keep aggregator job id ci (04.4 D-01). Leave squawk, desktop-web, desktop-rust, changes filters, draft gating, and SHA pins unchanged.

    Do not edit gitleaks.yml, zizmor.yml, backend-image.yml, or desktop-build.yml in this task.
  </action>
  <verify>
    <automated>python3 -c 'import yaml; w=yaml.safe_load(open(".github/workflows/ci.yml")); j=w["jobs"]; assert "backend-unit" in j and "backend-e2e" in j; assert "backend-test" not in j; assert j["backend-unit"]["timeout-minutes"]==15; assert j["backend-e2e"]["timeout-minutes"]==20; assert "services" not in j["backend-unit"]; assert "postgres" in j["backend-e2e"]["services"] and "redis" in j["backend-e2e"]["services"]; needs=j["ci"]["needs"]; assert needs==["changes","desktop-web","desktop-rust","backend-unit","backend-e2e","squawk"], needs; print("ci split ok")'</automated>
  </verify>
  <done>Two parallel backend jobs share the path-filter if; unit has no DB services and timeout 15; e2e has origin Postgres 16 / Redis 7 and timeout 20; aggregator ci gates both (D-02).</done>
</task>

<task type="auto">
  <name>Pin desktop runners to windows-2025 and macos-26</name>
  <files>.github/workflows/desktop-build.yml</files>
  <read_first>.github/workflows/desktop-build.yml (tauri matrix.os and the D-17 comment; setup-node package-manager-cache)</read_first>
  <action>
    Per D-04 (overrides 04.4 D-17): set the tauri strategy matrix os list to windows-2025 and macos-26. Update the comment above the list to say pin windows-2025 and macos-26 (arm64) from actions/runner-images 2026-09; not floating latest labels; not macos-26-xlarge (paid larger runner); not windows-2025-vs2026.

    Leave every other key: tags v* plus workflow_dispatch only, package-manager-cache false, no cargo cache step, rust-toolchain 1.97.1, FaynoSync publish, GH Release, concurrency, artifact retention, SHA pins.

    If local actionlint (same rhysd/actionlint:1.7.12 digest as zizmor.yml) errors on unknown runner labels, keep D-04 pins and record the actionlint message in the SUMMARY — do not silently revert to floating latest labels.

    Do not edit codeql.yml or ci.yml in this task.
  </action>
  <verify>
    <automated>python3 -c 'import yaml; w=yaml.safe_load(open(".github/workflows/desktop-build.yml")); os=w["jobs"]["tauri"]["strategy"]["matrix"]["os"]; assert os==["windows-2025","macos-26"], os; node=[s for s in w["jobs"]["tauri"]["steps"] if isinstance(s,dict) and str(s.get("uses","")).startswith("actions/setup-node@")]; assert node and node[0]["with"].get("package-manager-cache") is False; print("runners ok")'</automated>
  </verify>
  <done>Signed tauri matrix is windows-2025 + macos-26; comment matches D-04; signed job still has package-manager-cache false (D-02, D-04).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| pull_request (fork/same-repo) → CodeQL / ci.yml | Untrusted PR code; read-only GITHUB_TOKEN; no signing secrets |
| workflow_dispatch / v* tag → desktop-build | Trusted; TAURI_SIGNING_PRIVATE_KEY and FaynoSync token; signed updater artifacts |
| push main → backend-image | Trusted; GHCR write + Coolify deploy |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-cjp-01 | Tampering | desktop-build.yml tauri | high | mitigate | Keep package-manager-cache false; do not add Actions cache or cargo cache on the signed updater job (zizmor G1, 04.4 D-04). Speed via runner labels only (D-04). |
| T-cjp-02 | Information disclosure | codeql.yml analyze-rust | medium | accept | Rust CodeQL waits until push main / Monday 05:18 UTC schedule / dispatch. PR still has JS/TS CodeQL plus ci.yml cargo clippy/test. 8.5 min PR cost is the reason (D-02). |
| T-cjp-03 | Elevation of privilege | ci.yml backend-unit | low | accept | Unit job has no postgres/redis (origin split). If a unit test needs a live DB it fails the merge gate rather than silently hitting prod. |
| T-cjp-04 | Denial of service | codeql.yml pull_request | low | mitigate | Dropping Rust from PR cuts runner minutes; JS/TS stay. Do not add a duplicate-run skipper (D-03). |
| T-cjp-05 | Tampering | New third-party Actions | high | mitigate | No new Actions or package-manager installs this plan. Existing SHA pins stay. |
| T-cjp-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package-manager install tasks. T-cjp-SC closed by absence. |
</threat_model>

<verification>
python3 yaml.safe_load on the three edited files. Structural asserts in each task verify. Confirm git diff --name-only is only those three files. Confirm gitleaks.yml zizmor.yml backend-image.yml unchanged (git diff --exit-code). Do not push. Do not dispatch production desktop or create a v* tag.
</verification>

<success_criteria>
- analyze-rust cannot run on pull_request; analyze-js-typescript still can (D-02, D-03)
- backend-unit and backend-e2e exist; consolidated timeout-30 backend job gone; ci aggregator checks both (D-02)
- desktop-build matrix is windows-2025 and macos-26; signed setup-node still package-manager-cache false (D-04)
- No new dependencies or Actions; no GitHub Settings edits (D-01)
</success_criteria>

<output>
Create `.planning/quick/260904-cjp-re-verify-github-actions-brief-after-mai/260904-cjp-SUMMARY.md` when done
</output>
