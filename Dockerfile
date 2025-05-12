FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY .env.production .env

# Copy source and build
COPY . .
RUN pnpm build

# Production image
FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built files and dependencies
COPY --from=builder /app/ ./

# Expose port
EXPOSE 3000

# Start the production server on 0.0.0.0
CMD ["pnpm", "start", "-H", "0.0.0.0", "-p", "3000"]
