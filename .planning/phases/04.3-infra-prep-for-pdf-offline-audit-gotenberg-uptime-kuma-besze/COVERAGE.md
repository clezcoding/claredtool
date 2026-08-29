# API Coverage — Phase 04.3

> Full coverage by default. Opt-outs are explicit, reasoned decisions.

**Created:** 2026-08-29  
**Detector:** ROADMAP Phase 04.3 section + Gotenberg/Kuma/Beszel/Healthchecks/OTel/Grafana/BullMQ/Tauri plugins.

Assumption-delta (ROADMAP “optional OTEL on Gotenberg”): **no-change**. Primary noun remains Gotenberg stdout logs. CONTEXT **D-16** forbids Gotenberg OTEL in 4.3. Recorded in `04.3-02-PLAN.md` `<assumption_delta_decision>`.

---

## Gotenberg (`gotenberg/gotenberg:8.36.0`)

Source: gotenberg.dev Chromium + configuration tables; CONTEXT D-11–D-20.

| capability | decision | reason |
|---|---|---|
| POST `/forms/chromium/convert/html` (multipart HTML → PDF) | INTEGRATE | D-13 D-17 invoice pipe; tracer + worker |
| A4 form fields `paperWidth=8.27` `paperHeight=11.7` | INTEGRATE | D-20 |
| Basic Auth (`API_ENABLE_BASIC_AUTH` + username/password env) | INTEGRATE | D-12; 8.36 has no API-key flag |
| Chromium deny public+private IPs (empty allow-list) | INTEGRATE | D-20 |
| `API_TIMEOUT=30s` | INTEGRATE | RESEARCH pin |
| `API_DISABLE_DOWNLOAD_FROM=true` | INTEGRATE | D-20 |
| GET `/health` (Kuma internal) | INTEGRATE | RESEARCH matrix; fallback TCP :3000 if auth covers health (A3) |
| POST `/forms/chromium/convert/url` | OPT-OUT | D-17; SSRF / Chromium WAN |
| LibreOffice convert routes | OPT-OUT | D-13 unused in image; not invoice engine |
| PDF webhooks | OPT-OUT | not in CONTEXT; worker is pull/queue |
| Gotenberg OTEL / tracing flags | OPT-OUT | D-16 stdout only |
| Public FQDN / Coolify domain | OPT-OUT | D-11 internal alias `clared-gotenberg:3000` |
| Chromium Google Fonts / live URL assets | OPT-OUT | D-20 multipart / data URI only |
| Factur-X / ZUGFeRD manipulate | OPT-OUT | deferred Ideas; after visual PDF |
| OIDC on Gotenberg | OPT-OUT | RESEARCH rejected; Authentik down would break PDF |
| Desktop talking to Gotenberg | OPT-OUT | D-11 Nest/worker only |

---

## Uptime Kuma (`louislam/uptime-kuma:2.5.3`)

| capability | decision | reason |
|---|---|---|
| HTTPS dashboard + built-in login | INTEGRATE | D-01 D-05 |
| HTTP monitors: clared-api `/health`, Authentik, FaynoSync, Grafana login | INTEGRATE | D-02 D-28 |
| TCP monitors: Postgres uuid:5432, Redis uuid:6379 | INTEGRATE | D-02 internal |
| HTTP monitor Gotenberg internal `/health` + Basic Auth in Kuma | INTEGRATE | D-02 D-11 |
| Telegram notify: down, recovery, TLS expiry after retries | INTEGRATE | D-03 D-04 |
| Public status page | OPT-OUT | D-07 |
| Authentik / Cloudflare Access in front of Kuma | OPT-OUT | D-05 |
| Staging Kuma | OPT-OUT | D-06 prod only |
| Garage / Kaneo / Vaultwarden / side-apps | OPT-OUT | D-02 |
| Worker as Kuma target | OPT-OUT | D-02; no public host |
| Grafana-alerting → Telegram | OPT-OUT | D-28 Telegram = Kuma + Healthchecks only |

---

## Beszel (`henrygd/beszel` + `beszel-agent:0.18.8`)

| capability | decision | reason |
|---|---|---|
| Hub HTTPS + built-in login | INTEGRATE | D-01 |
| Agent docker.sock → hub (this VPS) | INTEGRATE | D-01 CPU/RAM/docker |
| Authentik in front of Beszel | OPT-OUT | D-05 |
| Hosting on Vercel | OPT-OUT | D-08 |

---

## Healthchecks.io

| capability | decision | reason |
|---|---|---|
| Dead-man check period 5 min / grace 5 min | INTEGRATE | D-08 |
| Coolify cron `*/2 * * * *` curl ping URL on `clared-api` | INTEGRATE | D-08 |
| Telegram on silence (same “Clared ops” group) | INTEGRATE | D-03 D-08 |
| Kuma-on-Vercel / GitHub Actions cron as VPS-down | OPT-OUT | D-08 |

---

## Grafana LGTM + Prometheus + OTel collector

| capability | decision | reason |
|---|---|---|
| Grafana OSS login HTTPS `grafana.puzzlessdev.online` | INTEGRATE | D-21 D-22 |
| Loki ingest OTLP `POST /otlp` | INTEGRATE | D-30 |
| Tempo traces | INTEGRATE | D-21 D-29 |
| Prometheus metrics (on-box) | INTEGRATE | D-21 |
| Collector receive OTLP HTTP 4318; export logs otlphttp → Loki | INTEGRATE | D-30 |
| ~7 day retention | INTEGRATE | D-26 |
| Coolify volumes Grafana/Loki/Tempo/Prometheus | INTEGRATE | D-27 |
| Nest Pino JSON stdout + OTLP logs (API + worker) | INTEGRATE | D-23 D-29 D-30 |
| HTTP request traces, no PII attributes | INTEGRATE | D-24 |
| Local exporters `none` | INTEGRATE | D-24 |
| Mimir | OPT-OUT | D-21 |
| Grafana Cloud | OPT-OUT | deferred Ideas |
| Promtail / Alloy / scrape Coolify log files as Loki contract | OPT-OUT | D-30 |
| lokiexporter | OPT-OUT | removed from collector-contrib |
| Authentik in front of Grafana | OPT-OUT | D-22 |
| Gotenberg → collector | OPT-OUT | D-16 D-29 |
| Grafana Telegram alerting | OPT-OUT | D-28 |

---

## BullMQ / Nest worker

| capability | decision | reason |
|---|---|---|
| Queue name `pdf-generation` prefix `clared-bull` on existing Redis | INTEGRATE | D-14 |
| Coolify app `clared-worker` same image, `start_command=node dist/worker.js`, no FQDN, no migrate | INTEGRATE | D-14 |
| Worker Gotenberg HTML convert (stub HTML, not invoice templates) | INTEGRATE | tracer; D-18 product generate is Phase 5 |
| Public PDF HTTP route / desktop Generate button | OPT-OUT | D-18 |
| MAIL-01 queued mail | OPT-OUT | deferred |

---

## Tauri plugins (desktop prep)

| capability | decision | reason |
|---|---|---|
| `tauri-plugin-sql` + SQLCipher `clared-offline.db` + `_init` | INTEGRATE | D-31 |
| SQLCipher key keychain `com.clared.app` / `offline-sqlcipher` | INTEGRATE | D-32 |
| official dialog + fs smokes in debug panel (DEV) | INTEGRATE | D-33 |
| fs scope `$APPDATA` + `$TEMP` only | INTEGRATE | D-34 |
| `tauri-plugin-sharekit` 0.4.0-rc.5 smoke DEV | INTEGRATE | D-35 skip SUS |
| Product save/share/PDF generate UI | OPT-OUT | D-18 D-33 |
| SQLite sync / product tables | OPT-OUT | Phase 5 OFFL-01 |
| CrabNebula PDF drag-out | OPT-OUT | Phase 5; 04.2 |
| `$HOME` / Downloads silent fs | OPT-OUT | D-34 |

---

## Cross-cutting

| Topic | Notes |
|-------|-------|
| Coolify | `user-coolify` MCP then `coolify` CLI. No dashboard, no SSH, no raw API curl |
| Authentik | Not in front of monitors. Kuma probes public `https://clared-auth.puzzlessdev.online` |
| Secrets | Env NAMES in git; values Coolify / OS keychain only |
| Prisma | No schema push. SQLCipher `_init` is desktop file DB |

---

*Phase 04.3 API coverage — planner*
