# To use this Dockerfile, you have to set `output: 'standalone'` in next.config.ts
# Based on: https://github.com/payloadcms/payload/blob/main/templates/blank/Dockerfile

FROM node:22-alpine AS base
RUN npm install -g pnpm

# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM base AS deps
# libc6-compat is needed for native modules on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL=https://nextacademyedu.com
ARG NEXT_PUBLIC_SERVER_URL
# Build-time placeholders are intentionally non-secret. Runtime env values override them.
ARG PAYLOAD_SECRET=build_placeholder_payload_secret_please_override_in_runtime
ARG DATABASE_URI=postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL:-$NEXT_PUBLIC_APP_URL}
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV DATABASE_URI=$DATABASE_URI
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV NEXT_TELEMETRY_DISABLED=1

RUN sh -c '(while sleep 20; do echo "[build] next.js build is still running..."; done) & HEARTBEAT_PID=$!; pnpm build; BUILD_EXIT=$?; kill $HEARTBEAT_PID; exit $BUILD_EXIT'

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_UPLOAD_DIR=/app/media
ENV PAYLOAD_MEDIA_BASE_URL=/media

# Coolify overrides the Dockerfile HEALTHCHECK with its own curl-based probe
RUN apk add --no-cache curl
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next
RUN mkdir -p /app/media
RUN chown -R nextjs:nodejs /app/media

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Payload needs i18n message files at runtime for next-intl
COPY --from=builder --chown=nextjs:nodejs /app/src/messages ./src/messages

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Increased start-period to 60s to allow Payload schema push on first boot
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.setTimeout(5000, () => { req.destroy(); process.exit(1); });"

CMD ["node", "server.js"]
