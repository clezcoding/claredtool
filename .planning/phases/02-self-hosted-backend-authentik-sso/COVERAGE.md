# Phase 2 — External API Coverage Matrix

Full capability surface for this phase’s integrations. Default is INTEGRATE; OPT-OUT needs a one-line reason. Locked CONTEXT decisions override library defaults.

Sources: Authentik 2026.8 docs, openid-client 6, NestJS 11, Prisma 7, ioredis 5, Tauri 2 official plugins.

## Authentik (`ghcr.io/goauthentik/server:2026.8.0`)

| Capability | Decision | Reason |
|---|---|---|
| OAuth2/OIDC provider (authorization code) | INTEGRATE | D-16 confidential RP; app name `clared` |
| PKCE S256 | INTEGRATE | RESEARCH Pattern 1; even for confidential client |
| OpenID scopes `openid profile email` | INTEGRATE | D-13 baseline |
| OpenID scope `groups` + groups mapping | INTEGRATE | AUTH-01; default three scopes omit groups |
| Application `clared` (one per instance) | INTEGRATE | D-13; local vs prod, same blueprint |
| Groups (eight `clared-*`) | INTEGRATE | D-24 |
| MFA / authenticator stages (in IdP WebView) | INTEGRATE | AUTH-01 SSO/MFA; Authentik owns UX |
| End-session / RP-initiated logout | INTEGRATE | D-21 |
| Blueprints YAML apply | INTEGRATE | D-13 same file local and prod |
| Vendor `compose.yml` (Postgres + server + worker) | INTEGRATE | D-11/D-12; tag `2026.8.0`; do not fork |
| Implicit grant | OPT-OUT | OAuth BCP + D-16; Authentik discourages |
| Device authorization grant | OPT-OUT | Extra Tauri window is the login path (D-15) |
| Client-credentials grant | OPT-OUT | User SSO, not M2M this phase |
| Refresh tokens | OPT-OUT | D-28 no refresh; 24h absolute opaque session |
| SAML provider | OPT-OUT | OIDC locked |
| LDAP / Radius / SCIM / RAC / Proxy provider | OPT-OUT | Not the desktop SSO path |
| Outposts | OPT-OUT | No reverse-proxy auth this phase |
| Directory sync / SCIM inbound | OPT-OUT | Invite/group assignment stays in Authentik admin (D-25) |
| Impersonation | OPT-OUT | D-25 `platform.impersonate` out |
| Events / notification rules | OPT-OUT | AUDT-01 is Phase 4 |
| Brands / custom flows beyond defaults | OPT-OUT | Use vendor default login flow |
| Policies / entitlement objects | OPT-OUT | Groups are SoT (D-22); Nest maps permissions |
| Authentik built-in Redis | OPT-OUT | Official 2026.8.0 compose has no Redis; Clared Redis is separate |
| Authentik on `clared` / `clared_app` Postgres | OPT-OUT | D-11 own Postgres only |
| `/etc/localtime` mount | OPT-OUT | Official: breaks OAuth |

## openid-client 6.8.7

| Capability | Decision | Reason |
|---|---|---|
| `discovery` | INTEGRATE | Issuer `…/application/o/clared/` |
| `ClientSecretPost` | INTEGRATE | Confidential client (D-16) |
| `randomPKCECodeVerifier` / `calculatePKCECodeChallenge` | INTEGRATE | Pattern 1 |
| `randomState` + `buildAuthorizationUrl` | INTEGRATE | CSRF `state` |
| `authorizationCodeGrant` | INTEGRATE | Code exchange on Nest |
| UserInfo fallback when ID token lacks `groups` | INTEGRATE | RESEARCH Pitfall 2 |
| Refresh token grant | OPT-OUT | D-28 |
| Implicit / hybrid | OPT-OUT | D-16 |
| Device flow | OPT-OUT | D-15 |
| JAR / PAR / DPoP | OPT-OUT | Authentik app does not require this phase |

## NestJS 11.2.1

| Capability | Decision | Reason |
|---|---|---|
| `@nestjs/platform-express` (default adapter) | INTEGRATE | Discretion: Fastify is not free |
| `@nestjs/config` | INTEGRATE | `AUTHENTIK_URL`, `CLIENT_ID`, `SECRET`, `DATABASE_URL`, `REDIS_URL`, `CORS_ORIGINS` |
| `@nestjs/swagger` `/api/docs` + `/openapi.json` | INTEGRATE | D-05 |
| `@nestjs/terminus` + `PrismaHealthIndicator` | INTEGRATE | D-09 `/health/ready` |
| Helmet on Express | INTEGRATE | Security headers |
| `ValidationPipe` whitelist | INTEGRATE | `POST /auth/session` DTO |
| CORS allowlist (Tauri origins) | INTEGRATE | Pitfall 5 |
| Global `AuthGuard` + `@Public()` | INTEGRATE | D-10 catch-all 401 |
| Fastify adapter | OPT-OUT | Discretion + Helmet/Swagger CSP cost |
| `@nestjs/passport` | OPT-OUT | Cookie/session machinery; we use opaque Bearer |
| GraphQL / WebSockets / microservices / schedule | OPT-OUT | REAL-01 v2; Phase 2 HTTP only |
| Invoice/entity controllers | OPT-OUT | D-10 / Phase 3 |

## Prisma 7.9.1 + `pg` 8.23.0

| Capability | Decision | Reason |
|---|---|---|
| `provider = "prisma-client"` + required `output` | INTEGRATE | D-06 |
| `prisma.config.ts` datasource URL | INTEGRATE | Prisma 7 |
| `@prisma/adapter-pg` + `PrismaPg` | INTEGRATE | Runtime adapter required |
| `prisma generate` in Docker before `nest build` | INTEGRATE | D-08 |
| `prisma migrate deploy` before Nest start | INTEGRATE | D-07 |
| `prisma db push` local (schema-push gate) | INTEGRATE | SCHEMA_PUSH_REQUIRED |
| Init migration (no business models) | INTEGRATE | Health still pings Postgres |
| User / Role models | OPT-OUT | D-22 groups are SoT |
| `migrate dev` in image/prod | OPT-OUT | D-07 |
| Prisma Studio / Accelerate / Pulse | OPT-OUT | Not needed |
| Seed of Authentik-linked users | OPT-OUT | Discretion: none this phase |

## ioredis 5.11.1

| Capability | Decision | Reason |
|---|---|---|
| `SET` with `EX` + `NX` | INTEGRATE | Tickets NX 60s; sessions EX 86400 |
| `GET` / `GETDEL` / `DEL` | INTEGRATE | One-time ticket; logout this device |
| Key prefixes `oauth:` `ticket:` `session:` | INTEGRATE | RESEARCH Pattern 2 |
| ioredis 6.0.0 | OPT-OUT | Pin 5.11.1; v6 just shipped |
| Pub/sub, streams, Cluster, Sentinel | OPT-OUT | Single Redis on Coolify/OrbStack |
| Store Authentik access tokens past callback | OPT-OUT | Ticket payload is claims only |
| Session cap / logout-everywhere | OPT-OUT | D-30; deferred |

## Tauri 2 (desktop)

| Capability | Decision | Reason |
|---|---|---|
| Extra `WebviewWindow` label `login` | INTEGRATE | D-15/D-19 |
| `on_navigation` allowlist `BACKEND_URL` + `AUTHENTIK_URL` | INTEGRATE | D-14 |
| Intercept `clared://` in-WebView | INTEGRATE | D-17 ticket |
| `@tauri-apps/plugin-deep-link` 2.4.9 scheme `clared` | INTEGRATE | OS protocol + cold start |
| `tauri-plugin-single-instance` + `deep-link` feature | INTEGRATE | Windows/Linux second process |
| `keyring` 4.x commands (service `com.clared.app`, account `session`) | INTEGRATE | D-27 OS keychain |
| Existing `tauri-plugin-opener` | INTEGRATE | Keep; register after single-instance |
| `@tauri-apps/plugin-os` hostname | INTEGRATE | D-29 Redis payload |
| Official Stronghold | OPT-OUT | Not OS keychain (D-27) |
| Community `tauri-plugin-keyring*` | OPT-OUT | Unofficial; legitimacy skip |
| System browser / opener as login path | OPT-OUT | D-15 extra window |
| `http` / `fs` / `shell` / `notification` / `updater` plugins | OPT-OUT | Desktop uses `fetch` + existing opener |
| Static `windows[]` entry for login | OPT-OUT | Spawn from async command (wry#583) |
| Keychain IPC on `login` capability | OPT-OUT | Pitfall 7 |

## Higgsfield CLI 1.1.23 (build-time)

| Capability | Decision | Reason |
|---|---|---|
| `gpt_image_2` 16:9 2k high | INTEGRATE | D-35; UI-SPEC prompt; `login-gate-hero.png` |
| Seedance / Marketing Studio / other models | OPT-OUT | Still image only |
| Cursor GenerateImage / stock | OPT-OUT | D-35 |
| Reuse `empty-state-hero.png` | OPT-OUT | UI-SPEC forbidden |
