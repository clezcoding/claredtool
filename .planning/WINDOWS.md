---
schema_version: 1
open_count: 35
waived_count: 1
fixed_count: 3
total_count: 39
last_updated: 2026-09-04T04:12:49.092Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | stub | apps/desktop/src/App.tsx | 25 | PlaceholderScreen for Entities / Kunden / Tax / PDF until 01-02 and 01-03 | fixed |  | 2026-08-19T13:28:18.947Z | 2026-08-19T14:00:31.637Z |
| 2 | 01 | stub | apps/desktop/public/empty-state-hero.png |  | 1x1 PNG placeholder until 01-04 Higgsfield illustration | fixed |  | 2026-08-19T13:28:19.032Z | 2026-08-19T14:09:03.224Z |
| 3 | 01 | deviation | apps/desktop/vite.config.ts | 19 | Vite/Tauri bound to 5174 because 5173 was occupied by BILLIT Vite | open |  | 2026-08-19T13:28:19.118Z |  |
| 4 | 01 | stub | apps/desktop/src/components/create-disabled-button.tsx | 6 | Disabled Anlegen is the D-31 Phase-3 mock — not a missing create form | waived | intentional D-31 Phase-3 mock; create is not a Phase-1 defect | 2026-08-19T13:59:25.117Z | 2026-08-19T14:00:31.800Z |
| 5 | 02 | skipped-test | apps/desktop/src/__tests__/auth-gate.test.tsx |  | describe.skip(phase02-auth) until 02-04 LoginGate | open |  | 2026-08-22T01:22:04.834Z |  |
| 6 | 02 | skipped-test | apps/desktop/src/__tests__/session-chip.test.tsx |  | describe.skip(phase02-auth) until 02-04 SessionChip | open |  | 2026-08-22T01:22:04.912Z |  |
| 7 | 02 | skipped-test | apps/desktop/src/__tests__/session-banner.test.tsx |  | describe.skip(phase02-auth) until 02-04 SessionBanner | open |  | 2026-08-22T01:22:04.991Z |  |
| 8 | 02 | deviation | pnpm-workspace.yaml |  | Allow prisma engine builds so pnpm --filter install succeeds | open |  | 2026-08-22T01:22:05.072Z |  |
| 9 | 02 | stub | apps/backend/src/auth/oidc.ts | 20 | AUTH_TEST_MODE skips live Authentik discovery until 02-05 | open |  | 2026-08-22T01:46:24.880Z |  |
| 10 | 02 | stub | apps/backend/src/auth/auth.controller.ts | 144 | endSessionUrl path string until 02-05 real Authentik end-session | open |  | 2026-08-22T01:46:24.969Z |  |
| 11 | 02 | stub | apps/desktop/src/auth/api.ts | 11 | setOnUnauthorized callback placeholder until 02-04 | open |  | 2026-08-22T01:46:25.055Z |  |
| 12 | 02 | deviation | apps/backend/test/auth.e2e-spec.ts |  | e2e seeds tickets and listen(0) for parallel GETDEL | open |  | 2026-08-22T01:46:25.164Z |  |
| 13 | 04 | deviation | apps/desktop/src/components/invoice-empty-state.tsx |  | CTA Beispielrechnung anzeigen restored; focuses form instead of sample restore (Phase 3) | open |  | 2026-08-23T01:18:49.549Z |  |
| 14 | 04 | unrun-verify | apps/desktop/index.html |  | Human cold-launch FOUC/splash check (04-UAT tests 1–3) not run in this executor | open |  | 2026-08-23T03:37:27.623Z |  |
| 15 | 04.1 | stub | apps/desktop/src/components/app-shell.tsx |  | Upgrade CTA is local Bald toast only (D-53, T-04.1-03); no billing route | open |  | 2026-08-27T03:32:20.564Z |  |
| 16 | 04.1 | stub | apps/desktop/src/components/app-shell.tsx |  | ⌘K chrome is Bald-only; full command palette deferred to Phase 5.1 (D-51/D-28) | open |  | 2026-08-27T03:32:20.656Z |  |
| 17 | 04.1 | stub | apps/desktop/src/routes/rechnung.tsx | 1199 | Send dialog Senden closes overlay only; no email API this wave | open |  | 2026-08-27T03:54:18.913Z |  |
| 18 | 04.1 | stub | apps/desktop/src/routes/rechnung.tsx | 1281 | Delete AlertDialog confirm closes overlay only; invoice DELETE not in this plan | open |  | 2026-08-27T03:54:19.019Z |  |
| 19 | 04.1 | stub | apps/desktop/src/routes/rechnung.tsx | 1217 | Save-template and duplicate menu items close menu only; persist APIs out of scope | open |  | 2026-08-27T03:54:19.112Z |  |
| 20 | 04.1 | stub | apps/desktop/src/components/registry-list-panel.tsx | 558 | Bank IBAN/BIC/Bankname render — until an API exists (D-14) | open |  | 2026-08-27T04:10:57.947Z |  |
| 21 | 04.1 | stub | apps/desktop/src/routes/tax.tsx |  | Neu ordnen Bald toast — no rule-reorder API (A5) | open |  | 2026-08-27T04:24:42.814Z |  |
| 22 | 04.1 | stub | apps/desktop/src/routes/tax.tsx |  | Dialog Regel speichern Bald + close — no rule-write API (A5) | open |  | 2026-08-27T04:24:42.903Z |  |
| 23 | 04.1 | stub | apps/desktop/src/routes/tax.tsx |  | modal Bedingung hinzufügen / delete Bald — chrome only until data plan | open |  | 2026-08-27T04:24:42.988Z |  |
| 24 | 04.1 | deviation | apps/desktop/src/__tests__/routes.test.tsx |  | Updated Tax heading Tax Rules → Steuerregeln so sidebar tests match i18n H1 | open |  | 2026-08-27T04:24:43.075Z |  |
| 25 | 04.1 | stub | apps/desktop/src/routes/pdf.tsx |  | download/email/print/full audit Bald toast — D-39 Phase 5 | open |  | 2026-08-27T05:15:02.431Z |  |
| 26 | 04.1 | stub | apps/desktop/src/components/export-panel.tsx |  | DATEV generate/row download/show-all/advisor Bald toast — D-40 Phase 5 | open |  | 2026-08-27T05:15:02.518Z |  |
| 27 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | open |  | 2026-08-28T03:40:47.736Z |  |
| 28 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | open |  | 2026-08-28T03:40:47.844Z |  |
| 29 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | open |  | 2026-08-28T03:40:47.964Z |  |
| 30 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | open |  | 2026-08-28T03:40:48.068Z |  |
| 31 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | open |  | 2026-08-28T03:40:48.167Z |  |
| 32 | 04.2 | stub | apps/desktop/src/lib/link-guard.ts | 5 | decideLinkAction stub returns block until Plan 03 | open |  | 2026-08-28T03:40:48.272Z |  |
| 33 | 04.2 | deviation | .planning/phases/04.2-desktop-platform-hardening-tauri-plugins-updater-log-prevent/04.2-VALIDATION.md |  | 04.2-03-T3 dragout skipped — human blocked tauri-plugin-dragout; Phase 5 CrabNebula drag | open |  | 2026-08-28T03:54:59.759Z |  |
| 34 | 04.2 | unrun-verify | apps/desktop/package.json |  | Full desktop vitest suite: clipboard.test.ts fails on pre-existing clipboard.ts stub | fixed |  | 2026-08-28T04:54:25.264Z | 2026-08-28T14:54:50.667Z |
| 35 | 04.3 | deviation | apps/desktop/src-tauri/src/lib.rs |  | PRAGMA key via sqlite3_auto_extension (plugin has no after_connect) | open |  | 2026-08-29T02:29:14.221Z |  |
| 36 | 04.3 | stub | .planning/phases/04.3-infra-prep-for-pdf-offline-audit-gotenberg-uptime-kuma-besze/04.3-MONITOR-OPS.md |  | Beszel KEY/TOKEN pending-h4 until Plan 08 H4 | open |  | 2026-08-29T04:41:07.137Z |  |
| 37 | 04.4 | deviation | .github/workflows/desktop-build.yml | 74 | Origin SC2129: Actionlint+ShellCheck style on desktop-build.yml; Plan 01 did not edit this file | open |  | 2026-09-04T03:52:31.413Z |  |
| 38 | 04.4 | deviation | .github/workflows/desktop-build.yml | 83 | Folded SC2129 GITHUB_OUTPUT redirects so in-workflow Actionlint can fail closed | open |  | 2026-09-04T04:12:49.010Z |  |
| 39 | 04.4 | deviation | .github/workflows/gitleaks.yml | 34 | upload-sarif and CLI SARIF use if: always() so findings still reach the Security tab when the job fails | open |  | 2026-09-04T04:12:49.092Z |  |

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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-19T13:28:19.118Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-22T01:22:04.834Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "skipped-test",
    "phase": "02",
    "file": "apps/desktop/src/__tests__/session-chip.test.tsx",
    "line": null,
    "description": "describe.skip(phase02-auth) until 02-04 SessionChip",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-22T01:22:04.912Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "skipped-test",
    "phase": "02",
    "file": "apps/desktop/src/__tests__/session-banner.test.tsx",
    "line": null,
    "description": "describe.skip(phase02-auth) until 02-04 SessionBanner",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-22T01:22:04.991Z",
    "resolved_at": null
  },
  {
    "id": 8,
    "kind": "deviation",
    "phase": "02",
    "file": "pnpm-workspace.yaml",
    "line": null,
    "description": "Allow prisma engine builds so pnpm --filter install succeeds",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-22T01:22:05.072Z",
    "resolved_at": null
  },
  {
    "id": 9,
    "kind": "stub",
    "phase": "02",
    "file": "apps/backend/src/auth/oidc.ts",
    "line": 20,
    "description": "AUTH_TEST_MODE skips live Authentik discovery until 02-05",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-22T01:46:24.880Z",
    "resolved_at": null
  },
  {
    "id": 10,
    "kind": "stub",
    "phase": "02",
    "file": "apps/backend/src/auth/auth.controller.ts",
    "line": 144,
    "description": "endSessionUrl path string until 02-05 real Authentik end-session",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-22T01:46:24.969Z",
    "resolved_at": null
  },
  {
    "id": 11,
    "kind": "stub",
    "phase": "02",
    "file": "apps/desktop/src/auth/api.ts",
    "line": 11,
    "description": "setOnUnauthorized callback placeholder until 02-04",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-22T01:46:25.055Z",
    "resolved_at": null
  },
  {
    "id": 12,
    "kind": "deviation",
    "phase": "02",
    "file": "apps/backend/test/auth.e2e-spec.ts",
    "line": null,
    "description": "e2e seeds tickets and listen(0) for parallel GETDEL",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-22T01:46:25.164Z",
    "resolved_at": null
  },
  {
    "id": 13,
    "kind": "deviation",
    "phase": "04",
    "file": "apps/desktop/src/components/invoice-empty-state.tsx",
    "line": null,
    "description": "CTA Beispielrechnung anzeigen restored; focuses form instead of sample restore (Phase 3)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-23T01:18:49.549Z",
    "resolved_at": null
  },
  {
    "id": 14,
    "kind": "unrun-verify",
    "phase": "04",
    "file": "apps/desktop/index.html",
    "line": null,
    "description": "Human cold-launch FOUC/splash check (04-UAT tests 1–3) not run in this executor",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-23T03:37:27.623Z",
    "resolved_at": null
  },
  {
    "id": 15,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/components/app-shell.tsx",
    "line": null,
    "description": "Upgrade CTA is local Bald toast only (D-53, T-04.1-03); no billing route",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T03:32:20.564Z",
    "resolved_at": null
  },
  {
    "id": 16,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/components/app-shell.tsx",
    "line": null,
    "description": "⌘K chrome is Bald-only; full command palette deferred to Phase 5.1 (D-51/D-28)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T03:32:20.656Z",
    "resolved_at": null
  },
  {
    "id": 17,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/rechnung.tsx",
    "line": 1199,
    "description": "Send dialog Senden closes overlay only; no email API this wave",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T03:54:18.913Z",
    "resolved_at": null
  },
  {
    "id": 18,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/rechnung.tsx",
    "line": 1281,
    "description": "Delete AlertDialog confirm closes overlay only; invoice DELETE not in this plan",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T03:54:19.019Z",
    "resolved_at": null
  },
  {
    "id": 19,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/rechnung.tsx",
    "line": 1217,
    "description": "Save-template and duplicate menu items close menu only; persist APIs out of scope",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T03:54:19.112Z",
    "resolved_at": null
  },
  {
    "id": 20,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/components/registry-list-panel.tsx",
    "line": 558,
    "description": "Bank IBAN/BIC/Bankname render — until an API exists (D-14)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T04:10:57.947Z",
    "resolved_at": null
  },
  {
    "id": 21,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/tax.tsx",
    "line": null,
    "description": "Neu ordnen Bald toast — no rule-reorder API (A5)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T04:24:42.814Z",
    "resolved_at": null
  },
  {
    "id": 22,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/tax.tsx",
    "line": null,
    "description": "Dialog Regel speichern Bald + close — no rule-write API (A5)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T04:24:42.903Z",
    "resolved_at": null
  },
  {
    "id": 23,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/tax.tsx",
    "line": null,
    "description": "modal Bedingung hinzufügen / delete Bald — chrome only until data plan",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T04:24:42.988Z",
    "resolved_at": null
  },
  {
    "id": 24,
    "kind": "deviation",
    "phase": "04.1",
    "file": "apps/desktop/src/__tests__/routes.test.tsx",
    "line": null,
    "description": "Updated Tax heading Tax Rules → Steuerregeln so sidebar tests match i18n H1",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T04:24:43.075Z",
    "resolved_at": null
  },
  {
    "id": 25,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/routes/pdf.tsx",
    "line": null,
    "description": "download/email/print/full audit Bald toast — D-39 Phase 5",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T05:15:02.431Z",
    "resolved_at": null
  },
  {
    "id": 26,
    "kind": "stub",
    "phase": "04.1",
    "file": "apps/desktop/src/components/export-panel.tsx",
    "line": null,
    "description": "DATEV generate/row download/show-all/advisor Bald toast — D-40 Phase 5",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-27T05:15:02.518Z",
    "resolved_at": null
  },
  {
    "id": 27,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:47.736Z",
    "resolved_at": null
  },
  {
    "id": 28,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:47.844Z",
    "resolved_at": null
  },
  {
    "id": 29,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:47.964Z",
    "resolved_at": null
  },
  {
    "id": 30,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:48.068Z",
    "resolved_at": null
  },
  {
    "id": 31,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:48.167Z",
    "resolved_at": null
  },
  {
    "id": 32,
    "kind": "stub",
    "phase": "04.2",
    "file": "apps/desktop/src/lib/link-guard.ts",
    "line": 5,
    "description": "decideLinkAction stub returns block until Plan 03",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-28T03:40:48.272Z",
    "resolved_at": null
  },
  {
    "id": 33,
    "kind": "deviation",
    "phase": "04.2",
    "file": ".planning/phases/04.2-desktop-platform-hardening-tauri-plugins-updater-log-prevent/04.2-VALIDATION.md",
    "line": null,
    "description": "04.2-03-T3 dragout skipped — human blocked tauri-plugin-dragout; Phase 5 CrabNebula drag",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-28T03:54:59.759Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-29T02:29:14.221Z",
    "resolved_at": null
  },
  {
    "id": 36,
    "kind": "stub",
    "phase": "04.3",
    "file": ".planning/phases/04.3-infra-prep-for-pdf-offline-audit-gotenberg-uptime-kuma-besze/04.3-MONITOR-OPS.md",
    "line": null,
    "description": "Beszel KEY/TOKEN pending-h4 until Plan 08 H4",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-29T04:41:07.137Z",
    "resolved_at": null
  },
  {
    "id": 37,
    "kind": "deviation",
    "phase": "04.4",
    "file": ".github/workflows/desktop-build.yml",
    "line": 74,
    "description": "Origin SC2129: Actionlint+ShellCheck style on desktop-build.yml; Plan 01 did not edit this file",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-04T03:52:31.413Z",
    "resolved_at": null
  },
  {
    "id": 38,
    "kind": "deviation",
    "phase": "04.4",
    "file": ".github/workflows/desktop-build.yml",
    "line": 83,
    "description": "Folded SC2129 GITHUB_OUTPUT redirects so in-workflow Actionlint can fail closed",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-04T04:12:49.010Z",
    "resolved_at": null
  },
  {
    "id": 39,
    "kind": "deviation",
    "phase": "04.4",
    "file": ".github/workflows/gitleaks.yml",
    "line": 34,
    "description": "upload-sarif and CLI SARIF use if: always() so findings still reach the Security tab when the job fails",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-04T04:12:49.092Z",
    "resolved_at": null
  }
]
````
