---
schema_version: 1
open_count: 11
waived_count: 1
fixed_count: 2
total_count: 14
last_updated: 2026-08-23T03:37:27.623Z
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
  }
]
````
