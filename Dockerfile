# syntax=docker/dockerfile:1.7

FROM oven/bun:1.2.21-alpine AS deps
WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.json bts.jsonc ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/env/package.json packages/env/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN bun install --frozen-lockfile

FROM deps AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN bun run build \
  && mkdir -p apps/web/.next/standalone/apps/web/.next apps/web/.next/standalone/apps/web/public \
  && cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static \
  && if [ -d apps/web/public ]; then cp -r apps/web/public/. apps/web/.next/standalone/apps/web/public/; fi

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/internal/health >/dev/null || exit 1

CMD ["sh", "-c", "if [ -f apps/web/server.js ]; then exec node apps/web/server.js; else exec node server.js; fi"]
