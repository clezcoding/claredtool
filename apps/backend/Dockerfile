FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11.15.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json

RUN pnpm install --frozen-lockfile --filter ./apps/backend...

COPY apps/backend apps/backend

WORKDIR /app/apps/backend

ARG DATABASE_URL=postgresql://build:build@127.0.0.1:5432/clared

RUN pnpm exec prisma generate && pnpm exec nest build && test -f dist/main.js

ENV DATABASE_URL=
ENV NODE_ENV=production

RUN chown -R node:node /app
USER node

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
