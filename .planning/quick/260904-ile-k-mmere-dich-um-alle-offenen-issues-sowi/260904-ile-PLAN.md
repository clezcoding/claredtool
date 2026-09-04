---
phase: quick-260904-ile
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - pnpm-workspace.yaml
  - pnpm-lock.yaml
autonomous: true
requirements:
  - SEC-06
  - SEC-07
  - SEC-08
  - GH-ISSUES
estimate:
  tokens: 22000
  raw_tokens: 22000
  tasks: 3
  confidence: low
must_haves:
  truths:
    - "pnpm-lock.yaml resolves qs@6.16.0 everywhere (Dependabot alerts #7 #8 cleared)"
    - "pnpm-lock.yaml resolves mysql2@3.23.1 everywhere (Dependabot alert #6 cleared)"
    - "Backend unit suite and nest build pass after override bump"
    - "Completed phase epics on GitHub are closed with state_reason completed and evidence links, not left open with status:done labels"
    - "Legitimate future-work issues (#37 Phase 06, #22 dev tool, #20/#15 human UAT) stay open"
  artifacts:
    - pnpm-workspace.yaml
    - pnpm-lock.yaml
  key_links:
    - from: pnpm-workspace.yaml overrides
      to: pnpm-lock.yaml settings.overrides
      via: pnpm install from repo root
      pattern: "grep -A6 '^overrides:' pnpm-workspace.yaml"
    - from: body-parser / express / supertest / prisma
      to: qs@6.16.0 and mysql2@3.23.1
      via: pnpm convergence overrides forcing patched transitive versions
      pattern: "grep -E 'qs@6\\.16\\.0|mysql2@3\\.23\\.1' pnpm-lock.yaml"
---

<objective>
Close the three open Dependabot security alerts (qs #7/#8, mysql2 #6) by bumping existing pnpm-workspace.yaml overrides to patched versions, then triage stale GitHub phase epics so completed work is closed with evidence instead of lingering OPEN.

Purpose: Security tab warnings must be fixed via real dependency resolution, not dismissed. Stale OPEN epics with status:done or merged phase work confuse backlog.
Output: pnpm-workspace.yaml + lockfile on qs@6.16.0 and mysql2@3.23.1; backend green; superseded GitHub issues closed.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@pnpm-workspace.yaml
@pnpm-lock.yaml
@package.json
@apps/backend/package.json

Security tab (2026-09-04), all open on main:

1. Alert #8: qs >=2.2.5,&lt;6.16.0 — DoS via Attacker Controlled isBuffer — fix qs@6.16.0+
2. Alert #7: qs 6.14.2-6.15.3 — arrayLimit bypass — fix qs@6.16.0+
3. Alert #6: mysql2 &lt;=3.23.0 — zlib inflate decompression-bomb DoS — fix mysql2@3.23.1+

Current lockfile: qs@6.15.3 (via express/body-parser/supertest), mysql2@3.22.0 (via prisma@7.10.0).

Overrides already live in pnpm-workspace.yaml (not root package.json): deepmerge-ts, fast-uri@3, mysql2@3.22.0. Lockfile settings.overrides mirrors that file. Extend the same block; do not add a duplicate pnpm.overrides in package.json.

Context7 pnpm: overrides field at project root forces any dependency in the graph to the given version; bare package name converges all edges. Use exact versions 6.16.0 and 3.23.1 (convergence override). After edit run pnpm install from repo root (not pnpm update on indirect deps — ERR_PNPM_UPDATE_VERSION_ON_INDIRECT_DEP).

Backend uses prisma@7.10.0 pinned; prisma depends on mysql2 as optional tooling dep. mysql2@3.23.1 is patch bump from 3.22.0; no prisma version change.

Phase 04.3 REVIEW clean. No open CodeQL alerts. CI and zizmor passing on main.

Open GitHub issues (11, mostly stale phase epics/UAT — not code bugs):

| # | Title | Triage hint |
|---|-------|-------------|
| 100 | 04.4-06 backend-image… | status:done label; Phase 04.4 complete (PR #111) — close completed |
| 99 | Phase 4.4 Epic | Phase 04.4 complete — close completed |
| 51 | 04.3-07 observability | Phase 04.3 complete — close completed |
| 29 | Phase 04.1 execute | Phase 04.1 complete — close completed |
| 27 | Phase 04.1 conversion | Phase 04.1 complete — close completed |
| 11 | Phase 4 Crafted Minimal | Phase 04 complete — close completed |
| 17 | 04-G mockup rebuild | Superseded by 04.1 / deferred to Phase 06 — close completed or comment + close |
| 37 | Phase 06 mockup fidelity | Future phase — keep OPEN |
| 22 | Tauri MCP Bridge | Dev tooling — keep OPEN unless shipped |
| 20 | Phase 4 human UAT | Human UAT — keep OPEN |
| 15 | UAT-4.1 visual walk | Human UAT — keep OPEN |

Cross-check each against STATE.md and merged PRs before closing. Use gh issue close --reason completed with a comment citing PR/commit. Do not close human UAT (#15, #20) or future Phase 06 (#37) without explicit completion evidence.
</context>

<tasks>

<task type="tracer">
  <name>End-to-end pnpm overrides — qs@6.16.0 + mysql2@3.23.1 (SEC-06–08)</name>
  <files>pnpm-workspace.yaml, pnpm-lock.yaml</files>
  <action>
    In pnpm-workspace.yaml overrides block (existing pattern per deepmerge-ts / fast-uri / mysql2), bump mysql2 from 3.22.0 to 3.23.1 and add qs: "6.16.0". Keep deepmerge-ts and fast-uri@3 entries unchanged. Do not duplicate overrides in root package.json.

    From repo root run pnpm install so pnpm-lock.yaml settings.overrides and resolved versions update.

    Confirm lockfile: exactly one qs package entry at 6.16.0 (no qs@6.15.3). Exactly one mysql2 entry at 3.23.1 (no mysql2@3.22.0). Grep importers and packages sections — all qs: and mysql2: edges must point to patched versions.

    Do not bump prisma, express, body-parser, or supertest direct versions; overrides alone must suffice. Do not dismiss or ignore Dependabot alerts via GitHub UI without the fix landing on the branch.
  </action>
  <verify>
    <automated>grep -q 'qs: "6.16.0"' pnpm-workspace.yaml &amp;&amp; grep -q 'mysql2: 3.23.1' pnpm-workspace.yaml &amp;&amp; grep -q 'qs: 6.16.0' pnpm-lock.yaml &amp;&amp; grep -q 'mysql2: 3.23.1' pnpm-lock.yaml &amp;&amp; test "$(grep -cE 'qs@6\.15\.3' pnpm-lock.yaml || true)" -eq 0 &amp;&amp; test "$(grep -cE 'mysql2@3\.22\.0' pnpm-lock.yaml || true)" -eq 0</automated>
  </verify>
  <done>pnpm-workspace.yaml lists qs@6.16.0 and mysql2@3.23.1; lockfile has no vulnerable qs or mysql2 versions; settings.overrides matches workspace file.</done>
</task>

<task type="auto">
  <name>Backend compile + unit regression after override bump</name>
  <files>apps/backend/package.json</files>
  <action>
    Prove Nest/Express stack still works with patched qs (body-parser query parsing) and prisma tooling still resolves with mysql2@3.23.1.

    From repo root: pnpm --filter @clared/tax-engine build, then pnpm --filter ./apps/backend exec prisma generate, pnpm --filter ./apps/backend exec nest build, pnpm --filter ./apps/backend test.

    If unit tests fail only on supertest/query parsing behavior, inspect failure — qs 6.16.0 is patch-level security fix; do not revert override. Fix test expectations only if qs API change is documented in qs changelog.

    Do not run full e2e unless unit suite passes; e2e needs compose Postgres and is optional for this security bump if unit + build green.
  </action>
  <verify>
    <automated>pnpm --filter @clared/tax-engine build &amp;&amp; pnpm --filter ./apps/backend exec prisma generate &amp;&amp; pnpm --filter ./apps/backend exec nest build &amp;&amp; pnpm --filter ./apps/backend test</automated>
  </verify>
  <done>tax-engine builds; backend prisma generate, nest build, and full unit suite pass on patched qs/mysql2 tree.</done>
</task>

<task type="auto">
  <name>Close superseded GitHub phase epics with evidence (GH-ISSUES)</name>
  <files></files>
  <action>
    Triage all 11 open issues against STATE.md completion status. For each issue whose phase work is already merged on main, close with gh issue close NUMBER --reason completed and add gh issue comment with PR link or commit SHA evidence.

    Minimum closes expected (verify before closing): #100 (04.4-06, status:done), #99 (Phase 4.4 epic, PR #111), #51 (04.3-07), #29 and #27 (Phase 04.1), #11 (Phase 4 Crafted Minimal). #17 close if mockup rebuild scope landed in 04.1 or explicitly deferred to Phase 06 per STATE.

    Keep OPEN: #37 (Phase 06 future), #22 (dev tooling unless done), #20 and #15 (human UAT).

    After security fix merges to main, confirm Dependabot alerts #6 #7 #8 show fixed (or note orchestrator must re-scan post-merge). Do not use dependabot ignore or alert dismiss without version fix on main.

    Use gh CLI only for GitHub issue ops; product tracking stays Kaneo for new work — this task is backlog hygiene on stale GitHub epics only.
  </action>
  <verify>
    <automated>gh issue list --state open --limit 20 --json number,title | node -e "const j=JSON.parse(require('fs').readFileSync(0,'utf8')); const stale=[100,99,51,29,27,11]; const open=new Set(j.map(i=>i.number)); const left=stale.filter(n=>open.has(n)); if(left.length) { console.error('Still open:', left); process.exit(1); } console.log('stale epics closed');"</automated>
  </verify>
  <done>Completed phase epics (#100 #99 #51 #29 #27 #11 at minimum) are CLOSED with completed reason and evidence comment; human UAT and Phase 06 issues remain open.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| npm registry → lockfile | Transitive qs/mysql2 versions must come from pinned overrides, not stale lockfile entries |
| Express body-parser → qs | Patched qs parses query strings for all HTTP traffic |
| prisma CLI → mysql2 | Patched mysql2 used only in prisma tooling path, not production Postgres runtime |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ile-01 | Denial of service | qs@6.15.3 | high | mitigate | SEC-07/08: override qs to 6.16.0 across graph |
| T-ile-02 | Denial of service | mysql2@3.22.0 | high | mitigate | SEC-06: bump override to 3.23.1 |
| T-ile-03 | Tampering | pnpm-workspace.yaml overrides | medium | mitigate | Exact version pins; verify lockfile grep gates |
| T-ile-04 | Information disclosure | stale OPEN epics | low | mitigate | GH-ISSUES: close completed with evidence so backlog reflects reality |
</threat_model>

<verification>
Task 1: workspace + lockfile version greps, no vulnerable entries. Task 2: backend build + unit suite. Task 3: gh issue list confirms stale epics closed. Post-merge: GitHub Security tab alerts #6–#8 should resolve when main contains the lockfile bump.
</verification>

<success_criteria>
- qs@6.16.0 and mysql2@3.23.1 in lockfile only
- Backend unit tests and nest build pass
- Stale completed phase GitHub issues closed with evidence
- Human UAT and Phase 06 issues untouched
- No alert dismiss without version fix
</success_criteria>

<output>
Create .planning/quick/260904-ile-k-mmere-dich-um-alle-offenen-issues-sowi/260904-ile-SUMMARY.md when done
</output>

<!-- gsd-multi-source-audit
GOAL: Fix open Dependabot security alerts (qs, mysql2); triage stale GitHub issues
REQ: SEC-06 mysql2, SEC-07/08 qs, GH-ISSUES triage
RESEARCH: Context7 pnpm overrides at root; exact version convergence; pnpm install not pnpm update indirect
CONTEXT: overrides in pnpm-workspace.yaml (existing); issues mostly stale epics not code bugs
COVERED: SEC-06–08→task1+task2; GH-ISSUES→task3
DEFERRED: none
-->
