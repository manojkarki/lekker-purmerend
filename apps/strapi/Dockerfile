# Production Dockerfile for Strapi
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Build the application
ENV NODE_ENV production
RUN pnpm run build

EXPOSE 1337

# Start the server
CMD ["pnpm", "start"]