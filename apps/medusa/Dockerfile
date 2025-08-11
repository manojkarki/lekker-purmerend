# Production Dockerfile for Medusa
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
COPY ../../packages/shared-types ./packages/shared-types/
COPY ../../packages/utils ./packages/utils/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

EXPOSE 9000

# Start the server
CMD ["pnpm", "start"]