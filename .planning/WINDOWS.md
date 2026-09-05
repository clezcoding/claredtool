---
schema_version: 1
open_count: 1
waived_count: 26
fixed_count: 15
total_count: 42
last_updated: 2026-09-05T22:52:51.535Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | stub | apps/desktop/src/App.tsx | 25 | PlaceholderScreen for Entities / Kunden / Tax / PDF until 01-02 and 01-03 | fixed |  | 2026-08-19T13:28:18.947Z | 2026-08-19T14:00:31.637Z |
| 2 | 01 | stub | apps/desktop/public/empty-state-hero.png |  | 1x1 PNG placeholder until 01-04 Higgsfield illustration | fixed |  | 2026-08-19T13:28:19.032Z | 2026-08-19T14:09:03.224Z |
| 3 | 01 | deviation | apps/desktop/vite.config.ts | 19 | Vite/Tauri bound to 5174 because 5173 was occupied by BILLIT Vite | waived | intentional port 5174 — BILLIT conflict documented D-01 Phase 01 | 2026-08-19T13:28:19.118Z | 2026-09-05T03:01:22.345Z |
| 4 | 01 | stub | apps/desktop/src/components/create-disabled-button.tsx | 6 | Disabled Anlegen is the D-31 Phase-3 mock — not a missing create form | waived | intentional D-31 Phase-3 mock; create is not a Phase-1 defect | 2026-08-19T13:59:25.117Z | 2026-08-19T14:00:31.800Z |
| 5 | 02 | skipped-test | apps/desktop/src/__tests__/auth-gate.test.tsx |  | describe.skip(phase02-auth) until 02-04 LoginGate | fixed |  | 2026-08-22T01:22:04.834Z | 2026-09-05T03:01:21.279Z |
| 6 | 02 | skipped-test | apps/desktop/src/__tests__/session-chip.test.tsx |  | describe.skip(phase02-auth) until 02-04 SessionChip | fixed |  | 2026-08-22T01:22:04.912Z | 2026-09-05T03:01:21.363Z |
| 7 | 02 | skipped-test | apps/desktop/src/__tests__/session-banner.test.tsx |  | describe.skip(phase02-auth) until 02-04 SessionBanner | fixed |  | 2026-08-22T01:22:04.991Z | 2026-09-05T03:01:21.448Z |
| 8 | 02 | deviation | pnpm-workspace.yaml |  | Allow prisma engine builds so pnpm --filter install succeeds | waived | intentional pnpm allowBuilds for prisma engines — Phase 02 decision | 2026-08-22T01:22:05.072Z | 2026-09-05T03:01:22.429Z |
| 9 | 02 | stub | apps/backend/src/auth/oidc.ts | 20 | AUTH_TEST_MODE skips live Authentik discovery until 02-05 | waived | AUTH_TEST_MODE is permanent test harness after Phase 02 — not a prod stub | 2026-08-22T01:46:24.880Z | 2026-09-05T03:01:22.513Z |
| 10 | 02 | stub | apps/backend/src/auth/auth.controller.ts | 144 | endSessionUrl path string until 02-05 real Authentik end-session | fixed |  | 2026-08-22T01:46:24.969Z | 2026-09-05T03:01:21.533Z |
| 11 | 02 | stub | apps/desktop/src/auth/api.ts | 11 | setOnUnauthorized callback placeholder until 02-04 | fixed |  | 2026-08-22T01:46:25.055Z | 2026-09-05T03:01:21.619Z |
| 12 | 02 | deviation | apps/backend/test/auth.e2e-spec.ts |  | e2e seeds tickets and listen(0) for parallel GETDEL | waived | intentional e2e parallel GETDEL pattern — Phase 02 | 2026-08-22T01:46:25.164Z | 2026-09-05T03:01:22.596Z |
| 13 | 04 | deviation | apps/desktop/src/components/invoice-empty-state.tsx |  | CTA Beispielrechnung anzeigen restored; focuses form instead of sample restore (Phase 3) | waived | intentional empty-state CTA behavior per UI-SPEC Phase 04 | 2026-08-23T01:18:49.549Z | 2026-09-05T03:01:22.680Z |
| 14 | 04 | unrun-verify | apps/desktop/index.html |  | Human cold-launch FOUC/splash check (04-UAT tests 1–3) not run in this executor | waived | human FOUC/splash UAT deferred — non-blocking for Phase 5 start | 2026-08-23T03:37:27.623Z | 2026-09-05T03:01:22.763Z |
| 15 | 04.1 | stub | apps/desktop/src/components/app-shell.tsx |  | Upgrade CTA is local Bald toast only (D-53, T-04.1-03); no billing route | waived | billing route deferred Phase 5.1+ per D-53 | 2026-08-27T03:32:20.564Z | 2026-09-05T03:01:22.847Z |
| 16 | 04.1 | stub | apps/desktop/src/components/app-shell.tsx |  | ⌘K chrome is Bald-only; full command palette deferred to Phase 5.1 (D-51/D-28) | waived | command palette deferred Phase 5.1 per D-51/D-28 | 2026-08-27T03:32:20.656Z | 2026-09-05T03:01:22.933Z |
| 17 | 04.1 | stub | apps/desktop/src/routes/rechnung.tsx | 1199 | Send dialog Senden closes overlay only; no email API this wave | waived | email send API deferred Phase 5 product scope | 2026-08-27T03:54:18.913Z | 2026-09-05T03:01:23.015Z |
| 18 | 04.1 | stub | apps/desktop/src/routes/rechnung.tsx | 1281 | Delete AlertDialog confirm closes overlay only; invoice DELETE not in this plan | waived | invoice DELETE deferred Phase 5 product scope | 2026-08-27T03:54:19.019Z | 2026-09-05T03:01:23.098Z |
| 19 | 04.1 | stub | apps/desktop/src/routes/rechnung.tsx | 1217 | Save-template and duplicate menu items close menu only; persist APIs out of scope | waived | template/duplicate persist deferred Phase 5 | 2026-08-27T03:54:19.112Z | 2026-09-05T03:01:23.183Z |
| 20 | 04.1 | stub | apps/desktop/src/components/registry-list-panel.tsx | 558 | Bank IBAN/BIC/Bankname render — until an API exists (D-14) | waived | bank fields deferred until entity API exposes IBAN D-14 | 2026-08-27T04:10:57.947Z | 2026-09-05T03:01:23.267Z |
| 21 | 04.1 | stub | apps/desktop/src/routes/tax.tsx |  | Neu ordnen Bald toast — no rule-reorder API (A5) | waived | tax rule reorder API deferred Phase 5 A5 | 2026-08-27T04:24:42.814Z | 2026-09-05T03:01:23.348Z |
| 22 | 04.1 | stub | apps/desktop/src/routes/tax.tsx |  | Dialog Regel speichern Bald + close — no rule-write API (A5) | waived | tax rule write API deferred Phase 5 A5 | 2026-08-27T04:24:42.903Z | 2026-09-05T03:01:23.431Z |
| 23 | 04.1 | stub | apps/desktop/src/routes/tax.tsx |  | modal Bedingung hinzufügen / delete Bald — chrome only until data plan | waived | tax condition modal data deferred Phase 5 | 2026-08-27T04:24:42.988Z | 2026-09-05T03:01:23.514Z |
| 24 | 04.1 | deviation | apps/desktop/src/__tests__/routes.test.tsx |  | Updated Tax heading Tax Rules → Steuerregeln so sidebar tests match i18n H1 | waived | intentional i18n test heading update Steuerregeln — Phase 04.1 | 2026-08-27T04:24:43.075Z | 2026-09-05T03:01:23.597Z |
| 25 | 04.1 | stub | apps/desktop/src/routes/pdf.tsx |  | download/email/print/full audit Bald toast — D-39 Phase 5 | waived | PDF download/email/audit deferred Phase 5 D-39 | 2026-08-27T05:15:02.431Z | 2026-09-05T03:01:23.680Z |
| 26 | 04.1 | stub | apps/desktop/src/components/export-panel.tsx |  | DATEV generate/row download/show-all/advisor Bald toast — D-40 Phase 5 | waived | DATEV export deferred Phase 5 D-40 | 2026-08-27T05:15:02.518Z | 2026-09-05T03:01:23.763Z |
| 27 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | fixed |  | 2026-08-28T03:40:47.736Z | 2026-09-05T03:01:21.705Z |
| 28 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | fixed |  | 2026-08-28T03:40:47.844Z | 2026-09-05T03:01:21.827Z |
| 29 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | fixed |  | 2026-08-28T03:40:47.964Z | 2026-09-05T03:01:21.919Z |
| 30 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | fixed |  | 2026-08-28T03:40:48.068Z | 2026-09-05T03:01:22.001Z |
| 31 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | fixed |  | 2026-08-28T03:40:48.167Z | 2026-09-05T03:01:22.088Z |
| 32 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | fixed |  | 2026-08-28T03:40:48.272Z | 2026-09-05T03:01:22.173Z |
| 33 | 04.2 | deviation | .planning/phases/04.2-desktop-platform-hardening-tauri-plugins-updater-log-prevent/04.2-VALIDATION.md |  | 04.2-03-T3 dragout skipped — human blocked tauri-plugin-dragout; Phase 5 CrabNebula drag | waived | dragout deferred Phase 5 CrabNebula plugin per 04.2 decision | 2026-08-28T03:54:59.759Z | 2026-09-05T03:01:23.848Z |
| 34 | 04.2 | unrun-verify | apps/desktop/package.json |  | Full desktop vitest suite: clipboard.test.ts fails on pre-existing clipboard.ts stub | fixed |  | 2026-08-28T04:54:25.264Z | 2026-08-28T14:54:50.667Z |
| 35 | 04.3 | deviation | apps/desktop/src-tauri/src/lib.rs |  | PRAGMA key via sqlite3_auto_extension (plugin has no after_connect) | waived | intentional PRAGMA via sqlite3_auto_extension D-32 | 2026-08-29T02:29:14.221Z | 2026-09-05T03:01:23.932Z |
| 36 | 04.3 | stub | .planning/phases/04.3-infra-prep-for-pdf-offline-audit-gotenberg-uptime-kuma-besze/04.3-MONITOR-OPS.md |  | Beszel KEY/TOKEN pending-h4 until Plan 08 H4 | waived | Beszel agent enroll deferred human H4 Coolify ops | 2026-08-29T04:41:07.137Z | 2026-09-05T03:01:24.015Z |
| 37 | 04.4 | deviation | .github/workflows/desktop-build.yml | 74 | Origin SC2129: Actionlint+ShellCheck style on desktop-build.yml; Plan 01 did not edit this file | waived | documented SC2129 deviation desktop-build.yml 04.4 | 2026-09-04T03:52:31.413Z | 2026-09-05T03:01:24.099Z |
| 38 | 04.4 | deviation | .github/workflows/desktop-build.yml | 83 | Folded SC2129 GITHUB_OUTPUT redirects so in-workflow Actionlint can fail closed | waived | documented GITHUB_OUTPUT fold for Actionlint 04.4 | 2026-09-04T04:12:49.010Z | 2026-09-05T03:01:24.183Z |
| 39 | 04.4 | deviation | .github/workflows/gitleaks.yml | 34 | upload-sarif and CLI SARIF use if: always() so findings still reach the Security tab when the job fails | waived | documented gitleaks SARIF if:always() 04.4 D-10 | 2026-09-04T04:12:49.092Z | 2026-09-05T03:01:24.266Z |
| 40 | 04.4 | deviation | .github/zizmor.yml |  | Ignore artipacked on sync-labels.yml (D-36 frozen file) | waived | documented zizmor artipacked ignore sync-labels D-36 | 2026-09-04T04:57:54.775Z | 2026-09-05T03:01:24.354Z |
| 41 | 04.5 | unrun-verify | .planning/phases/04.5-repository-reliability-performance-maintainability-hardening/04.5-VALIDATION.md |  | backend-image after-run walltime pending post-merge gh run view | fixed |  | 2026-09-05T00:00:33.809Z | 2026-09-05T03:01:22.257Z |
| 42 | 04.7 | deviation | packages/e-invoice/src/serialize-cii.ts |  | strict:false + xsd-schema-validator allowBuilds false; Mustang/KoSIT owns XSD/Schematron in CI | open |  | 2026-09-05T22:52:51.535Z |  |

````json
[
  {
    "id": 1,
    "kind": "stub",
    "phase": "01",
    "file": "apps/desktop/src/App.tsx",
    "line": 25,
    "description": "PlaceholderScreen for Entities / Kunden / Tax / PDF until 01-02 and 01-03",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-19T13:28:18.947Z",
    "resolved_at": "2026-08-19T14:00:31.637Z"
  },
  {
    "id": 2,
    "kind": "stub",
    "phase": "01",
    "file": "apps/desktop/public/empty-state-hero.png",
    "line": null,
    "description": "1x1 PNG placeholder until 01-04 Higgsfield illustration",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-19T13:28:19.032Z",
    "resolved_at": "2026-08-19T14:09:03.224Z"
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "01",
    "file": "apps/desktop/vite.config.ts",
    "line": 19,
    "description": "Vite/Tauri bound to 5174 because 5173 was occupied by BILLIT Vite",
    "status": "waived",
    "reason": "intentional port 5174 — BILLIT conflict documented D-01 Phase 01",
    "recorded_at": "2026-08-19T13:28:19.118Z",
    "resolved_at": "2026-09-05T03:01:22.345Z"
  },
  {
    "id": 4,
    "kind": "stub",
    "phase": "01",
    "file": "apps/desktop/src/components/create-disabled-button.tsx",
    "line": 6,
    "description": "Disabled Anlegen is the D-31 Phase-3 mock — not a missing create form",
    "status": "waived",
    "reason": "intentional D-31 Phase-3 mock; create is not a Phase-1 defect",
    "recorded_at": "2026-08-19T13:59:25.117Z",
    "resolved_at": "2026-08-19T14:00:31.800Z"
  },
  {
    "id": 5,
    "kind": "skipped-test",
    "phase": "02",
    "file": "apps/desktop/src/__tests__/auth-gate.test.tsx",
    "line": null,
    "description": "describe.skip(phase02-auth) until 02-04 LoginGate",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-22T01:22:04.834Z",
    "resolved_at": "2026-09-05T03:01:21.279Z"
  },
  {
    "id": 6,
    "kind": "skipped-test",
    "phase": "02",
    "file": "apps/desktop/src/__tests__/session-chip.test.tsx",
    "line": null,
    "description": "describe.skip(phase02-auth) until 02-04 SessionChip",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-22T01:22:04.912Z",
    "resolved_at": "2026-09-05T03:01:21.363Z"
  },
  {
    "id": 7,
    "kind": "skipped-test",
    "phase": "02",
    "file": "apps/desktop/src/__tests__/session-banner.test.tsx",
    "line": null,
    "description": "describe.skip(phase02-auth) until 02-04 SessionBanner",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-22T01:22:04.991Z",
    "resolved_at": "2026-09-05T03:01:21.448Z"
  },
  {
    "id": 8,
    "kind": "deviation",
    "phase": "02",
    "file": "pnpm-workspace.yaml",
    "line": null,
    "description": "Allow prisma engine builds so pnpm --filter install succeeds",
    "status": "waived",
    "reason": "intentional pnpm allowBuilds for prisma engines — Phase 02 decision",
    "recorded_at": "2026-08-22T01:22:05.072Z",
    "resolved_at": "2026-09-05T03:01:22.429Z"
  },
  {
    "id": 9,
    "kind": "stub",
    "phase": "02",
    "file": "apps/backend/src/auth/oidc.ts",
    "line": 20,
    "description": "AUTH_TEST_MODE skips live Authentik discovery until 02-05",
    "status": "waived",
    "reason": "AUTH_TEST_MODE is permanent test harness after Phase 02 — not a prod stub",
    "recorded_at": "2026-08-22T01:46:24.880Z",
    "resolved_at": "2026-09-05T03:01:22.513Z"
  },
  {
    "id": 10,
    "kind": "stub",
    "phase": "02",
    "file": "apps/backend/src/auth/auth.controller.ts",
    "line": 144,
    "description": "endSessionUrl path string until 02-05 real Authentik end-session",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-22T01:46:24.969Z",
    "resolved_at": "2026-09-05T03:01:21.533Z"
  },
  {
    "id": 11,
    "kind": "stub",
    "phase": "02",
    "file": "apps/desktop/src/auth/api.ts",
    "line": 11,
    "description": "setOnUnauthorized callback placeholder until 02-04",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-22T01:46:25.055Z",
    "resolved_at": "2026-09-05T03:01:21.619Z"
  },
  {
    "id": 12,
    "kind": "deviation",
    "phase": "02",
    "file": "apps/backend/test/auth.e2e-spec.ts",
    "line": null,
    "description": "e2e seeds tickets and listen(0) for parallel GETDEL",
    "status": "waived",
    "reason": "intentional e2e parallel GETDEL pattern — Phase 02",
    "recorded_at": "2026-08-22T01:46:25.164Z",
    "resolved_at": "2026-09-05T03:01:22.596Z"
  },
  {
    "id": 13,
    "kind": "deviation",
    "phase": "04",
    "file": "apps/desktop/src/components/invoice-empty-state.tsx",
    "line": null,
    "description": "CTA Beispielrechnung anzeigen restored; focuses form instead of sample restore (Phase 3)",
    "status": "waived",
    "reason": "intentional empty-state CTA behavior per UI-SPEC Phase 04",
    "recorded_at": "2026-08-23T01:18:49.549Z",
    "resolved_at": "2026-09-05T03:01:22.680Z"
  },
  {
    "id": 14,
    "kind": "unrun-verify",
    "phase": "04",
    "file": "apps/desktop/index.html",
    "line": null,
    "description": "Human cold-launch FOUC/splash check (04-UAT tests 1–3) not run in this executor",
    "status": "waived",
    "reason": "human FOUC/splash UAT deferred — non-blocking for Phase 5 start",
    "recorded_at": "2026-08-23T03:37:27.623Z",
    "resolved_at": "2026-09-05T03:01:22.763Z"
  },
  {
    "id": 15,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/components/app-shell.tsx",
    "line": null,
    "description": "Upgrade CTA is local Bald toast only (D-53, T-04.1-03); no billing route",
    "status": "waived",
    "reason": "billing route deferred Phase 5.1+ per D-53",
    "recorded_at": "2026-08-27T03:32:20.564Z",
    "resolved_at": "2026-09-05T03:01:22.847Z"
  },
  {
    "id": 16,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/components/app-shell.tsx",
    "line": null,
    "description": "⌘K chrome is Bald-only; full command palette deferred to Phase 5.1 (D-51/D-28)",
    "status": "waived",
    "reason": "command palette deferred Phase 5.1 per D-51/D-28",
    "recorded_at": "2026-08-27T03:32:20.656Z",
    "resolved_at": "2026-09-05T03:01:22.933Z"
  },
  {
    "id": 17,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/rechnung.tsx",
    "line": 1199,
    "description": "Send dialog Senden closes overlay only; no email API this wave",
    "status": "waived",
    "reason": "email send API deferred Phase 5 product scope",
    "recorded_at": "2026-08-27T03:54:18.913Z",
    "resolved_at": "2026-09-05T03:01:23.015Z"
  },
  {
    "id": 18,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/rechnung.tsx",
    "line": 1281,
    "description": "Delete AlertDialog confirm closes overlay only; invoice DELETE not in this plan",
    "status": "waived",
    "reason": "invoice DELETE deferred Phase 5 product scope",
    "recorded_at": "2026-08-27T03:54:19.019Z",
    "resolved_at": "2026-09-05T03:01:23.098Z"
  },
  {
    "id": 19,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/rechnung.tsx",
    "line": 1217,
    "description": "Save-template and duplicate menu items close menu only; persist APIs out of scope",
    "status": "waived",
    "reason": "template/duplicate persist deferred Phase 5",
    "recorded_at": "2026-08-27T03:54:19.112Z",
    "resolved_at": "2026-09-05T03:01:23.183Z"
  },
  {
    "id": 20,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/components/registry-list-panel.tsx",
    "line": 558,
    "description": "Bank IBAN/BIC/Bankname render — until an API exists (D-14)",
    "status": "waived",
    "reason": "bank fields deferred until entity API exposes IBAN D-14",
    "recorded_at": "2026-08-27T04:10:57.947Z",
    "resolved_at": "2026-09-05T03:01:23.267Z"
  },
  {
    "id": 21,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/tax.tsx",
    "line": null,
    "description": "Neu ordnen Bald toast — no rule-reorder API (A5)",
    "status": "waived",
    "reason": "tax rule reorder API deferred Phase 5 A5",
    "recorded_at": "2026-08-27T04:24:42.814Z",
    "resolved_at": "2026-09-05T03:01:23.348Z"
  },
  {
    "id": 22,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/tax.tsx",
    "line": null,
    "description": "Dialog Regel speichern Bald + close — no rule-write API (A5)",
    "status": "waived",
    "reason": "tax rule write API deferred Phase 5 A5",
    "recorded_at": "2026-08-27T04:24:42.903Z",
    "resolved_at": "2026-09-05T03:01:23.431Z"
  },
  {
    "id": 23,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/tax.tsx",
    "line": null,
    "description": "modal Bedingung hinzufügen / delete Bald — chrome only until data plan",
    "status": "waived",
    "reason": "tax condition modal data deferred Phase 5",
    "recorded_at": "2026-08-27T04:24:42.988Z",
    "resolved_at": "2026-09-05T03:01:23.514Z"
  },
  {
    "id": 24,
    "kind": "deviation",
    "phase": "04.1",
    "file": "apps/desktop/src/__tests__/routes.test.tsx",
    "line": null,
    "description": "Updated Tax heading Tax Rules → Steuerregeln so sidebar tests match i18n H1",
    "status": "waived",
    "reason": "intentional i18n test heading update Steuerregeln — Phase 04.1",
    "recorded_at": "2026-08-27T04:24:43.075Z",
    "resolved_at": "2026-09-05T03:01:23.597Z"
  },
  {
    "id": 25,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/pdf.tsx",
    "line": null,
    "description": "download/email/print/full audit Bald toast — D-39 Phase 5",
    "status": "waived",
    "reason": "PDF download/email/audit deferred Phase 5 D-39",
    "recorded_at": "2026-08-27T05:15:02.431Z",
    "resolved_at": "2026-09-05T03:01:23.680Z"
  },
  {
    "id": 26,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/components/export-panel.tsx",
    "line": null,
    "description": "DATEV generate/row download/show-all/advisor Bald toast — D-40 Phase 5",
    "status": "waived",
    "reason": "DATEV export deferred Phase 5 D-40",
    "recorded_at": "2026-08-27T05:15:02.518Z",
    "resolved_at": "2026-09-05T03:01:23.763Z"
  },
  {
    "id": 27,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:47.736Z",
    "resolved_at": "2026-09-05T03:01:21.705Z"
  },
  {
    "id": 28,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:47.844Z",
    "resolved_at": "2026-09-05T03:01:21.827Z"
  },
  {
    "id": 29,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:47.964Z",
    "resolved_at": "2026-09-05T03:01:21.919Z"
  },
  {
    "id": 30,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:48.068Z",
    "resolved_at": "2026-09-05T03:01:22.001Z"
  },
  {
    "id": 31,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:48.167Z",
    "resolved_at": "2026-09-05T03:01:22.088Z"
  },
  {
    "id": 32,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:48.272Z",
    "resolved_at": "2026-09-05T03:01:22.173Z"
  },
  {
    "id": 33,
    "kind": "deviation",
    "phase": "04.2",
    "file": ".planning/phases/04.2-desktop-platform-hardening-tauri-plugins-updater-log-prevent/04.2-VALIDATION.md",
    "line": null,
    "description": "04.2-03-T3 dragout skipped — human blocked tauri-plugin-dragout; Phase 5 CrabNebula drag",
    "status": "waived",
    "reason": "dragout deferred Phase 5 CrabNebula plugin per 04.2 decision",
    "recorded_at": "2026-08-28T03:54:59.759Z",
    "resolved_at": "2026-09-05T03:01:23.848Z"
  },
  {
    "id": 34,
    "kind": "unrun-verify",
    "phase": "04.2",
    "file": "apps/desktop/package.json",
    "line": null,
    "description": "Full desktop vitest suite: clipboard.test.ts fails on pre-existing clipboard.ts stub",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-28T04:54:25.264Z",
    "resolved_at": "2026-08-28T14:54:50.667Z"
  },
  {
    "id": 35,
    "kind": "deviation",
    "phase": "04.3",
    "file": "apps/desktop/src-tauri/src/lib.rs",
    "line": null,
    "description": "PRAGMA key via sqlite3_auto_extension (plugin has no after_connect)",
    "status": "waived",
    "reason": "intentional PRAGMA via sqlite3_auto_extension D-32",
    "recorded_at": "2026-08-29T02:29:14.221Z",
    "resolved_at": "2026-09-05T03:01:23.932Z"
  },
  {
    "id": 36,
    "kind": "stub",
    "phase": "04.3",
    "file": ".planning/phases/04.3-infra-prep-for-pdf-offline-audit-gotenberg-uptime-kuma-besze/04.3-MONITOR-OPS.md",
    "line": null,
    "description": "Beszel KEY/TOKEN pending-h4 until Plan 08 H4",
    "status": "waived",
    "reason": "Beszel agent enroll deferred human H4 Coolify ops",
    "recorded_at": "2026-08-29T04:41:07.137Z",
    "resolved_at": "2026-09-05T03:01:24.015Z"
  },
  {
    "id": 37,
    "kind": "deviation",
    "phase": "04.4",
    "file": ".github/workflows/desktop-build.yml",
    "line": 74,
    "description": "Origin SC2129: Actionlint+ShellCheck style on desktop-build.yml; Plan 01 did not edit this file",
    "status": "waived",
    "reason": "documented SC2129 deviation desktop-build.yml 04.4",
    "recorded_at": "2026-09-04T03:52:31.413Z",
    "resolved_at": "2026-09-05T03:01:24.099Z"
  },
  {
    "id": 38,
    "kind": "deviation",
    "phase": "04.4",
    "file": ".github/workflows/desktop-build.yml",
    "line": 83,
    "description": "Folded SC2129 GITHUB_OUTPUT redirects so in-workflow Actionlint can fail closed",
    "status": "waived",
    "reason": "documented GITHUB_OUTPUT fold for Actionlint 04.4",
    "recorded_at": "2026-09-04T04:12:49.010Z",
    "resolved_at": "2026-09-05T03:01:24.183Z"
  },
  {
    "id": 39,
    "kind": "deviation",
    "phase": "04.4",
    "file": ".github/workflows/gitleaks.yml",
    "line": 34,
    "description": "upload-sarif and CLI SARIF use if: always() so findings still reach the Security tab when the job fails",
    "status": "waived",
    "reason": "documented gitleaks SARIF if:always() 04.4 D-10",
    "recorded_at": "2026-09-04T04:12:49.092Z",
    "resolved_at": "2026-09-05T03:01:24.266Z"
  },
  {
    "id": 40,
    "kind": "deviation",
    "phase": "04.4",
    "file": ".github/zizmor.yml",
    "line": null,
    "description": "Ignore artipacked on sync-labels.yml (D-36 frozen file)",
    "status": "waived",
    "reason": "documented zizmor artipacked ignore sync-labels D-36",
    "recorded_at": "2026-09-04T04:57:54.775Z",
    "resolved_at": "2026-09-05T03:01:24.354Z"
  },
  {
    "id": 41,
    "kind": "unrun-verify",
    "phase": "04.5",
    "file": ".planning/phases/04.5-repository-reliability-performance-maintainability-hardening/04.5-VALIDATION.md",
    "line": null,
    "description": "backend-image after-run walltime pending post-merge gh run view",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-09-05T00:00:33.809Z",
    "resolved_at": "2026-09-05T03:01:22.257Z"
  },
  {
    "id": 42,
    "kind": "deviation",
    "phase": "04.7",
    "file": "packages/e-invoice/src/serialize-cii.ts",
    "line": null,
    "description": "strict:false + xsd-schema-validator allowBuilds false; Mustang/KoSIT owns XSD/Schematron in CI",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-05T22:52:51.535Z",
    "resolved_at": null
  }
]
````
