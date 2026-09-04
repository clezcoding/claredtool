FROM node:24-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

# Runtime is node + pnpm. Drop the node:24-bookworm-slim npm bundle so
# Trivy does not fail on unused HIGH brace-expansion / tar / ip-address.
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate \
  && rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/tax-engine/package.json packages/tax-engine/package.json

RUN pnpm install --frozen-lockfile --filter @clared/tax-engine... --filter ./apps/backend...

COPY packages/tax-engine packages/tax-engine
COPY apps/backend apps/backend

WORKDIR /app

RUN pnpm --filter @clared/tax-engine build

WORKDIR /app/apps/backend

ARG DATABASE_URL=postgresql://build:build@127.0.0.1:5432/clared

RUN rm -f tsconfig.build.tsbuildinfo \
  && pnpm exec prisma generate \
  && pnpm exec nest build \
  && test -f dist/main.js \
  && test -f dist/worker.js

ENV DATABASE_URL=
ENV NODE_ENV=production

# Build residue. Not a runtime path.
RUN rm -rf /root/.cache /tmp/*

RUN chown -R node:node /app
USER node

# Coolify dockerfile build pack ignores start_command (Nixpacks-only).
# Last stage stays API. Worker app sets dockerfile_target_build=worker.
FROM build AS worker
CMD ["node", "dist/worker.js"]

FROM build AS api
# API container CMD is the only migrator. Coolify Postgres is Docker-internal DNS;
# GitHub-hosted runners cannot reach it. Multi-replica later needs exactly one
# external migrator (brief 6.6) — do not activate.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
