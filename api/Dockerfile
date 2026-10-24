# ─── Build Stage ────────────────────────────────────────────────────────────
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema and config
COPY prisma ./prisma
COPY prisma7.config.ts ./

# Generate Prisma Client into ./generated/prisma
RUN npx prisma generate --config prisma7.config.ts

# Copy the rest of the source
COPY . .

# ─── Production Stage ────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy generated Prisma client + source from builder
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/app.js ./
COPY --from=builder /app/Modules ./Modules
COPY --from=builder /app/MIddlewares ./MIddlewares
COPY --from=builder /app/Utils ./Utils
COPY --from=builder /app/config ./config
COPY --from=builder /app/src ./src

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE ${PORT}

# Run migrations then start server
ENTRYPOINT ["./docker-entrypoint.sh"]