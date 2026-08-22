# Phase 2: User Setup Required

**Generated:** 2026-08-22
**Phase:** 02-self-hosted-backend-authentik-sso
**Status:** Incomplete

Local Postgres + Redis for Nest `/health/ready` and `prisma migrate deploy`. Nest itself stays native `pnpm`. Authentik is 02-05.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `DATABASE_URL` | Copy from `apps/backend/.env.example` (local OrbStack only — never a production secret) | `apps/backend/.env` |
| [ ] | `REDIS_URL` | Copy from `apps/backend/.env.example` | `apps/backend/.env` |
| [ ] | `SECRET` | Local-only value from `.env.example` (`local-only`). Laptop never stores the Coolify production secret (D-13). | `apps/backend/.env` |

## Dashboard Configuration

- [ ] **OrbStack running**
  - Location: local machine — OrbStack 2.x
  - Set to: Docker engine available (`docker info` succeeds)
  - Notes: If port 5432 is already a different Postgres, compose Postgres is still reachable on the container IP; keep `.env.example` on `127.0.0.1:5432` for machines where OrbStack owns that port.

## Local Development

```bash
docker compose -f compose.clared.yml up -d
cp apps/backend/.env.example apps/backend/.env
cd apps/backend && npx prisma migrate deploy
```

## Verification

```bash
docker compose -f compose.clared.yml ps
pnpm --filter ./apps/backend test:e2e -- health
```

Expected results:
- `postgres` (and `redis`) containers running
- `GET /health` 200
- `GET /health/ready` 200 when compose Postgres is the `DATABASE_URL` target

---

**Once all items complete:** Mark status as "Complete" at top of file.
