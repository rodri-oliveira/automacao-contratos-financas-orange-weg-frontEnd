FROM registry-docker.weg.net/node:20 AS base

FROM base AS deps

ARG NODE_VERSION
ARG NEXUS_USERNAME
ARG NEXUS_PASSWORD

WORKDIR /app

COPY . .

RUN npm config set //nexus3.weg.net/repository/npm-group/:_auth $(echo -n "$NEXUS_USERNAME:$NEXUS_PASSWORD" | openssl base64)

RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx next build --no-lint

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
