---
phase: 2
slug: self-hosted-backend-authentik-sso
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 + Testing Library (desktop); Nest `@nestjs/testing` 11.2.1 + `supertest` (backend) |
| **Config file** | `apps/desktop/vitest.config.ts` (existing); backend none yet — Wave 0 `apps/backend/package.json` script `test` |
| **Quick run command** | `pnpm --filter ./apps/desktop test` and/or `pnpm --filter ./apps/backend test` |
| **Full suite command** | `pnpm --filter ./apps/desktop test && pnpm --filter ./apps/backend test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick command for the touched app (`pnpm --filter ./apps/desktop test` and/or `pnpm --filter ./apps/backend test`)
- **After every plan wave:** Run `pnpm --filter ./apps/desktop test && pnpm --filter ./apps/backend test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | 00 | 0 | BACK-01 | — | Nest app + `test` script exist | infra | `pnpm --filter ./apps/backend test` | ❌ W0 | ⬜ pending |
| 02-health | 01 | 1 | BACK-01 | — | `GET /health` 200 without DB | e2e | `pnpm --filter ./apps/backend test -- health` | ❌ W0 | ⬜ pending |
| 02-ready | 01 | 1 | BACK-01 | — | `GET /health/ready` 200 with Postgres (or 503 if down) | e2e | `pnpm --filter ./apps/backend test -- health` | ❌ W0 | ⬜ pending |
| 02-401 | 01 | 1 | BACK-01 | T-unauth | Unauthenticated `GET /me` and `GET /api/invoices` → 401 | e2e | `pnpm --filter ./apps/backend test -- auth` | ❌ W0 | ⬜ pending |
| 02-rbac | 02 | 1 | AUTH-01 | T-rbac | Group union + `primaryRole` precedence | unit | `pnpm --filter ./apps/backend test -- rbac` | ❌ W0 | ⬜ pending |
| 02-ticket | 02 | 1 | AUTH-01 | T-replay | Ticket one-time: second `POST /auth/session` 401 | unit/e2e | `pnpm --filter ./apps/backend test -- ticket` | ❌ W0 | ⬜ pending |
| 02-session | 02 | 1 | AUTH-01 | T-session | Session EX 86400 / logout DEL | unit | `pnpm --filter ./apps/backend test -- ticket` | ❌ W0 | ⬜ pending |
| 02-gate | 03 | 2 | AUTH-01 | — | Gate copy + Anmelden; no shell | unit | `pnpm --filter ./apps/desktop test` | ❌ W0 | ⬜ pending |
| 02-chip | 03 | 2 | AUTH-01 | — | Chip badge German labels | unit | `pnpm --filter ./apps/desktop test` | ❌ W0 | ⬜ pending |
| 02-banner | 03 | 2 | AUTH-01 | — | 401 banner vs `ErrorState` network | unit | `pnpm --filter ./apps/desktop test` | ❌ W0 | ⬜ pending |
| 02-boot | 03 | 2 | AUTH-01 | — | Silent boot spinner `sr-only` „Wird geladen“ | unit | `pnpm --filter ./apps/desktop test` | partial ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Existing desktop tests (`routes.test.tsx`) assert nav `["Rechnung", "Entities", "Kunden", "Tax", "PDF"]` and land on `RE-2026-001` — must stay green when gate wrapping is added (signed-in fixture).

---

## Wave 0 Requirements

- [ ] `apps/backend/` Nest app + `package.json` `test` script
- [ ] `apps/backend/src/auth/rbac.spec.ts` — AUTH-01 catalog + D-23 precedence
- [ ] `apps/backend/test/health.e2e-spec.ts` — BACK-01
- [ ] `apps/backend/test/auth.e2e-spec.ts` — 401 catch-all + ticket
- [ ] Desktop tests: gate, chip, banners, signed-in fixture so Phase 1 route tests still pass
- [ ] Fake Redis in unit tests (in-memory Map behind a tiny interface) — do **not** add `ioredis-mock` unless needed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OIDC login against live Authentik (MFA/WebView) | AUTH-01 | Live IdP + MFA + extra Tauri window cannot be automated this phase | Sign in via login window; confirm ticket redeem, session chip, `/me` payload |
| Coolify one-click deploy of vendor Authentik + Clared compose | BACK-01 | Founder cluster UI | Deploy `compose.yml` + `compose.clared.yml`; curl `/health` and `/health/ready` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
