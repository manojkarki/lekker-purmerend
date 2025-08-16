# Development Dockerfile for Strapi (volume-safe, using regular linux for better compatibility)
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libvips-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# Copy package file
COPY package.json ./

# Install dependencies without frozen lockfile for development
RUN pnpm install --no-frozen-lockfile

# Rebuild sharp for the current architecture with proper flags
RUN npm rebuild sharp --platform=linux --arch=arm64v8

# Backup node_modules for volume mounting
RUN cp -r node_modules /tmp/node_modules

# Copy source code
COPY . .

EXPOSE 1337

# Create an entrypoint script to handle node_modules volume
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Use custom entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "run", "develop"]