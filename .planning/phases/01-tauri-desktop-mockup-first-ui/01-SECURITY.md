---
phase: 01
slug: tauri-desktop-mockup-first-ui
status: verified
threats_open: 0
asvs_level: 1
created: 2026-08-20
---

# Phase 01 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm/cargo registry → build | Third-party packages pulled during scaffold/install | Package manifests, compiled artifacts |
| WebView → OS | Tauri WebView renders local bundle; no IPC commands this phase | Rendered HTML/CSS/JS only |
| user input (mock form fields) → React state | Editable invoice fields; no persist, no network, no eval | Local form strings/numbers |
| static sample data → React render | Entities/Kunden/Tax read hardcoded SAMPLE_INVOICE | Staged sample invoice data |
| Higgsfield CLI → local filesystem | External CLI writes PNG into public/; no runtime integration | Static illustration asset |
| CI runner → build | GitHub Actions builds Tauri bundle; no secrets/signing this phase | Source, build artifacts |
| demo-state switcher → React state | Local UI toggle only; no network, no persist | Demo mode union (`ready`/`loading`/`error`) |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-01-01 | Tampering | Tauri IPC / commands | low | accept | No Tauri commands defined — `lib.rs` has zero `#[tauri::command]` handlers | closed |
| T-01-02 | Info Disclosure | WebView filesystem access | low | accept | No filesystem/allowlist capabilities enabled; Tauri default deny-all | closed |
| T-01-03 | Tampering | Tauri CSP (`security.csp: null`) | low | accept | Permissive CSP acceptable for local mockup-only app; tighten before Phase 2 network calls | closed |
| T-01-SC | Tampering | npm/cargo installs | high | mitigate | Package Legitimacy Audit in `01-RESEARCH.md` (2026-08-19); all packages verified | closed |
| T-01-04 | Tampering | Mock form inputs (Rechnung form, „+ Position“) | low | accept | Local React state only; no persist, no injection sink | closed |
| T-01-05 | Info Disclosure | Staged tax/PDF surfaces | low | mitigate | `SAMPLE_INVOICE` hardcoded in `sample-invoice.ts`; no real user/financial data | closed |
| T-01-06 | Tampering | Tauri IPC / commands | low | accept | No Tauri commands added; IPC surface zero | closed |
| T-01-07 (P03) | Elevation of Privilege | Disabled „Anlegen“ mock buttons | low | accept | `CreateDisabledButton` is `disabled`; no create path wired | closed |
| T-01-08 (P03) | Info Disclosure | Read-only fake detail panels | low | accept | Only `SAMPLE_INVOICE` seller/buyer shown | closed |
| T-01-09 (P03) | Tampering | Tauri IPC / commands | low | accept | No Tauri commands added; IPC surface zero | closed |
| T-01-10 | Tampering | Higgsfield-generated asset | low | accept | Static PNG at `public/empty-state-hero.png`; no code execution | closed |
| T-01-11 | Info Disclosure | GitHub Actions workflow | low | accept | No secrets or signing keys; public build steps only | closed |
| T-01-12 | Tampering | CI dependency install (pnpm/cargo on runners) | high | mitigate | Same Package Legitimacy Audit as 01-01; toolchain actions pinned `@v4` in `desktop-build.yml` | closed |
| T-01-07 (P05) | Tampering | Demo-state switcher (ready/loading/error) | low | accept | Local `useState` union only in `rechnung.tsx`; no persist/network | closed |
| T-01-08 (P05) | Info Disclosure | ErrorState message | low | mitigate | Fixed UI-SPEC string in `error-state.tsx`; no real error object/stack surfaced | closed |
| T-01-09 (P05) | Denial of Service | Loading demo surface | low | accept | Pure render branch; no timers/loops hitting network | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

> **Note:** Plans 01-03 and 01-05 reuse threat IDs T-01-07/08/09 for different components. Disambiguated above with plan suffix (P03/P05). Consider renumbering in a future planning pass.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01-01 | T-01-01 | Phase 1 mockup has zero IPC surface; no commands to attack | gsd-secure-phase | 2026-08-20 |
| AR-01-02 | T-01-02 | Tauri default deny-all; no filesystem capabilities enabled | gsd-secure-phase | 2026-08-20 |
| AR-01-03 | T-01-03 | Local-only mockup; CSP tightened deferred to Phase 2 before network calls | gsd-secure-phase | 2026-08-20 |
| AR-01-04 | T-01-04 | Form data stays in React state; no persist or server sink | gsd-secure-phase | 2026-08-20 |
| AR-01-06 | T-01-06 | IPC surface remains zero through Plan 01-02 | gsd-secure-phase | 2026-08-20 |
| AR-01-07 | T-01-07 (P03) | Create buttons disabled; RBAC deferred to Phase 3 | gsd-secure-phase | 2026-08-20 |
| AR-01-08 | T-01-08 (P03) | Detail panels show hardcoded sample data only | gsd-secure-phase | 2026-08-20 |
| AR-01-09 | T-01-09 (P03) | No Tauri commands added in Plan 01-03 | gsd-secure-phase | 2026-08-20 |
| AR-01-10 | T-01-10 | Static illustration asset; visual review at commit time | gsd-secure-phase | 2026-08-20 |
| AR-01-11 | T-01-11 | CI has no secrets/signing this phase | gsd-secure-phase | 2026-08-20 |
| AR-01-12 | T-01-07 (P05) | Demo switcher is local state flip only | gsd-secure-phase | 2026-08-20 |
| AR-01-13 | T-01-09 (P05) | Loading branch is pure render; no I/O exhaustion path | gsd-secure-phase | 2026-08-20 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-20 | 16 | 16 | 0 | gsd-secure-phase (L1 grep, ASVS-1 short-circuit) |

### Security Audit 2026-08-20

| Metric | Count |
|--------|-------|
| Threats found | 16 |
| Closed | 16 |
| Open | 0 |

**Method:** State B (no prior SECURITY.md). Threat register parsed from five PLAN.md `<threat_model>` blocks. L1 grep verification at ASVS level 1 — all `mitigate` controls found in implementation; all `accept` risks logged above. No `gsd-security-auditor` spawn (short-circuit: `threats_open: 0`, `register_authored_at_plan_time: true`, `asvs_level: 1`).

**Key evidence:**
- `apps/desktop/src-tauri/src/lib.rs` — no `#[tauri::command]`
- `apps/desktop/src-tauri/tauri.conf.json` — `csp: null`, no extra capabilities
- `.planning/phases/01-tauri-desktop-mockup-first-ui/01-RESEARCH.md` — Package Legitimacy Audit section
- `.github/workflows/desktop-build.yml` — `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`
- `apps/desktop/src/data/sample-invoice.ts` — `SAMPLE_INVOICE` hardcoded staged data
- `apps/desktop/src/components/error-state.tsx` — fixed UI-SPEC error copy
- `apps/desktop/src/` — no `fetch(` calls

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-20
