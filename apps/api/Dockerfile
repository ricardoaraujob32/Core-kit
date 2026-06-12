FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable

COPY tsconfig.base.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma

RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

COPY packages/core packages/core
COPY apps/api apps/api
COPY tsconfig.json ./

RUN pnpm -C packages/core exec tsc --noEmit
RUN pnpm -C apps/api exec tsc --noEmit

WORKDIR /app/apps/api

EXPOSE 3333

CMD ["pnpm", "dev"]