# ─── Stage 1: Build Stage ─────────────────────────────────────────────────────
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the client application
RUN npm run build

# ─── Stage 2: Production Preview Runner ───────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled static assets and configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.js ./

ENV NODE_ENV=production
ENV PORT=4173

EXPOSE 4173

# Serve using Vite preview bound to all network interfaces
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
