# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --workspace=frontend

# Copy frontend source files
COPY frontend/ ./frontend/

# Build static production bundle
WORKDIR /app/frontend
RUN npm run build

# --- Stage 2: Nginx Web Server ---
FROM nginx:alpine AS runner

# Copy compiled SPA dist
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy Nginx server configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
