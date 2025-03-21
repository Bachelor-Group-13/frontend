# Start from the Node 22 image (replace with node:20 if you prefer LTS)
FROM node:22-alpine

# Create a working directory
WORKDIR /app

# Copy only package files first to cache layer
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of your source code
COPY . .

# Expose port 3000 for Next.js
EXPOSE 3000

# By default, run in dev mode
CMD ["pnpm", "dev"]
