FROM node:20-alpine

WORKDIR /app

# Bruk Corepack for å installere pnpm riktig
RUN corepack enable && corepack prepare pnpm@latest --activate

# Kopier pakkedefinisjoner og installer avhengigheter
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Kopier resten av prosjektet
COPY . .

# Eksponer dev-server port
EXPOSE 3000

# Start dev-server
CMD ["pnpm", "dev"]
