# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --workspace=backend

# Copy backend source files
COPY backend/ ./backend/

# Generate Prisma client & compile TypeScript
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=5000

# Copy built dist & dependencies
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/node_modules /app/node_modules

# Create upload directory
RUN mkdir -p /app/backend/uploads

EXPOSE 5000

# Run migrations and start production API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
