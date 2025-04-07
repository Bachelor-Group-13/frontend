FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY . .

RUN npm install -g pnpm && pnpm install
RUN pnpm build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]

