# Phase 2: User Setup Required

**Generated:** 2026-08-22
**Phase:** 02-self-hosted-backend-authentik-sso
**Status:** Incomplete

Claude shipped Nest OIDC, vendor `compose.yml`, and `blueprints/clared.yaml`. Apply the blueprint and Coolify env yourself — those need Authentik admin and founder-cluster access.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `DATABASE_URL` | Local OrbStack Clared Postgres (`clared` / `clared_app`). Never the Authentik database. | `apps/backend/.env` |
| [ ] | `REDIS_URL` | Local OrbStack Clared Redis (`compose.clared.yml`) | `apps/backend/.env` |
| [ ] | `AUTHENTIK_URL` | Local: `http://localhost:9000`. Prod: Coolify Authentik public URL | `apps/backend/.env` (local) / Coolify env (prod) |
| [ ] | `CLIENT_ID` | Authentik provider `clared` (blueprint sets `clared`) | `apps/backend/.env` (local) / Coolify env (prod) |
| [ ] | `SECRET` | Authentik provider `clared` client secret. **Local-only on the laptop. Production SECRET lives only in Coolify (D-13).** | `apps/backend/.env` (local placeholder `local-only`) / Coolify env (prod) |
| [ ] | `BACKEND_URL` | Local Nest `http://localhost:3000`. Prod: Coolify API URL (blueprint instance context `backend_callback`) | `apps/backend/.env` / Coolify + Authentik blueprint context |
| [ ] | `CORS_ORIGINS` | `tauri://localhost,https://tauri.localhost,http://localhost:5174` | `apps/backend/.env` / Coolify env |
| [ ] | `AUTH_TEST_MODE` | `1` for mocked e2e only. Unset (or `0`) for live Authentik login. **MUST NOT set on Coolify clared-api (CR-03).** | `apps/backend/.env` (local only) |

## Dashboard Configuration

- [ ] **OrbStack running**
  - Location: local machine — OrbStack 2.x
  - Set to: Docker engine available (`docker info` succeeds)

- [ ] **Apply `blueprints/clared.yaml` to local Authentik**
  - Location: Authentik admin — Customization → Blueprints → Import
  - Set to: app name `clared`, eight `clared-*` groups, OpenID `groups` scope
  - Notes: One OAuth app per instance (D-13). Override instance context `backend_callback` if Nest is not `http://localhost:3000/auth/callback`.

- [ ] **Copy local CLIENT_ID and SECRET into `apps/backend/.env`**
  - Location: Authentik provider `clared`
  - Notes: Never paste the production SECRET onto the laptop.

- [x] **Coolify Dockerfile build of `apps/backend` (not Nixpacks)**
  - Location: Coolify application `clared-api` (uuid `yzmje7zsrp1qwtvsd7izjhaf`)
  - Set to: build pack Dockerfile; `dockerfile_location` `/apps/backend/Dockerfile`; git branch `gsd/phase-02-self-hosted-backend-authentik-sso`
  - Notes: Image installs openssl + curl (Coolify HTTP healthcheck needs curl/wget in a Dockerfile pack). Do not switch to Nixpacks (D-08). Do not set `AUTH_TEST_MODE` on this app (CR-03). Vendor HTTPS `https://clared-api.puzzlessdev.online/health` is live after 02-07.

- [ ] **Coolify env for prod API**
  - Location: Coolify application environment
  - Set: `AUTHENTIK_URL`, `CLIENT_ID`, `SECRET`, `DATABASE_URL` (Postgres `clared` / role `clared_app`), `REDIS_URL`, `CORS_ORIGINS`, `BACKEND_URL`

## Local Development

Authentik `compose.yml` also needs a **repo-root** `.env` with `PG_PASS` and `AUTHENTIK_SECRET_KEY` (vendor file). That is not `apps/backend/.env`.

```bash
# repo-root .env for Authentik compose only — generate local secrets, never prod
docker compose -f compose.yml -f compose.clared.yml up -d
cp apps/backend/.env.example apps/backend/.env
# after blueprint apply: set SECRET from the local Authentik provider; unset AUTH_TEST_MODE for live login
pnpm --filter ./apps/backend start
```

## Verification

```bash
docker compose -f compose.yml -f compose.clared.yml ps
curl -sS http://localhost:3000/health
curl -sS http://localhost:3000/health/ready
curl -sfS -o /dev/null -w '%{http_code}' https://clared-api.puzzlessdev.online/health
curl -sfS -o /dev/null -w '%{http_code}' https://clared-api.puzzlessdev.online/health/ready
```

Expected results:
- Authentik `server` + its own `postgresql`, plus Clared `postgres` + `redis`
- `GET /health` 200
- `GET /health/ready` 200 against Clared Postgres (not Authentik's DB)
- Desktop Anmelden completes Authentik MFA; chip `primaryRole`; `GET /me` has `groups`

---

**Once all items complete:** Mark status as "Complete" at top of file.
