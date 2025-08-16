# Development Dockerfile for Next.js (monorepo-aware)
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /monorepo

# Copy root package files for workspace setup
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy workspace packages
COPY packages ./packages

# Copy web app
COPY apps/web ./apps/web

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

WORKDIR /monorepo/apps/web

EXPOSE 3000

# Start in development mode
CMD ["pnpm", "run", "dev"]