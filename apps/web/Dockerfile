FROM node:24-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY apps/web/package.json apps/web/package.json

COPY tsconfig.base.json ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

COPY apps/web apps/web

WORKDIR /app/apps/web

RUN pnpm exec tsc --noEmit
RUN pnpm run build

EXPOSE 4173

CMD ["pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "4173"]