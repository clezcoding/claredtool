---
phase: 04
slug: premium-ui-brand-redesign
status: verified
threats_open: 0
asvs_level: 1
created: 2026-08-23
---

# Phase 04 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| localStorage → webview | Persisted theme pref read at boot (untrusted local storage) | `clared-theme` enum string |
| native menu → webview | Tauri Darstellung menu action dispatches into the React app | `ThemePref` (`light` / `dark` / `system`) |
| user input → invoice form | Numeric/text fields in line-item-card / rechnung (existing V5 validation) | Menge / Einzelpreis numbers |
| static asset → webview | First-party PNGs in `apps/desktop/public/` loaded by `<img>` | Local `/empty-*.png` paths |
| CLI → filesystem | higgsfield CLI writes a generated PNG into `public/` (build-time only) | PNG bytes, no runtime fetch |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-04-01 | Tampering | localStorage[`clared-theme`] | low | mitigate | `currentPref()` in `apps/desktop/src/lib/theme.ts` — `PREFS` enum guard; unknown/missing → `"system"`; covered by `theme.test.ts` | closed |
| T-04-02 | Elevation of privilege | Darstellung menu action | low | accept | Menu actions call `applyTheme` only; no `eval`, no new privileged IPC (keychain/session unchanged) | closed |
| T-04-03 | Tampering | globals.css token asset | low | accept | First-party CSS built into the bundle; no remote token source | closed |
| T-04-04 | Tampering | line-item-card numeric coercion | low | mitigate | `Number(...) \|\| 0` kept on Menge and Einzelpreis in `apps/desktop/src/components/line-item-card.tsx` | closed |
| T-04-05 | Information Disclosure | PdfPaper dark-theme invert | low | mitigate | D-09: `pdf-paper.tsx` inline `background: "#fff"` / `color: "#111"` so invoice numbers stay readable | closed |
| T-04-06 | Tampering | public/*.png illustration assets | low | mitigate | First-party PNGs only (`/empty-entities.png`, `/empty-state-hero.png`); no remote/runtime image URLs (D-25) | closed |
| T-04-07 | Spoofing | login-gate hero asset | low | accept | Cosmetic; login-gate currently uses typography hero, not the PNG. Auth path still `session.login()` / `open_login_window` (Phase 2 OIDC unchanged) | closed |
| T-04-SC | Tampering | npm/cargo installs | low | accept | No package install this phase (RESEARCH: deps pre-existing; higgsfield is build-time CLI, not a runtime dep) | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

> **Note:** `T-04-SC` appears in plans 04-01, 04-02, and 04-03. Recorded once.

SUMMARY threat flags: none recorded across 04-01–04-03 SUMMARY files.

L1 grep evidence (2026-08-23):
- T-04-01: `theme.ts` `PREFS.has(stored)`; tests for unknown stored value.
- T-04-04: `line-item-card.tsx` `Number(event.target.value) \|\| 0` on both numeric fields.
- T-04-05: `pdf-paper.tsx` inline light paper colors.
- T-04-06: `<img src="/empty-*.png">` only; no `https://` image URLs in `apps/desktop/src`.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-04-01 | T-04-02 | Native menu only toggles theme class via `applyTheme`; no new IPC to privileged commands | gsd-secure-phase | 2026-08-23 |
| AR-04-02 | T-04-03 | Token CSS is first-party and bundled; no remote stylesheet/token fetch | gsd-secure-phase | 2026-08-23 |
| AR-04-03 | T-04-SC | Phase added no npm/cargo packages; Package Legitimacy Gate not applicable | gsd-secure-phase | 2026-08-23 |
| AR-04-04 | T-04-07 | Login-gate hero is cosmetic (currently unused PNG / typography); OIDC login path unchanged from Phase 2 | gsd-secure-phase | 2026-08-23 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-23 | 8 | 8 | 0 | gsd-secure-phase (ASVS L1 grep; register at plan time, threats_open 0) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-23
