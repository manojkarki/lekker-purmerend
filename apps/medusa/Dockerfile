FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy monorepo manifests so pnpm can resolve workspace deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY .npmrc ./

# Copy workspace packages and the medusa app
COPY packages ./packages
COPY apps/medusa ./apps/medusa

# Install deps for the whole workspace (frozen to lockfile)
RUN pnpm install --frozen-lockfile

# Build the Medusa server (TypeScript -> JS)
WORKDIR /app/apps/medusa
RUN pnpm run build

# Build the Admin UI statically so it can be served at /app in production
RUN npx --yes medusa-admin build --path /app

EXPOSE 9000

# Start the server; Admin will be served at /app in production
ENV NODE_ENV=production
CMD ["pnpm", "start"]