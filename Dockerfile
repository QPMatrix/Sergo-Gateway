# Development Stage
FROM node:alpine AS development

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and lockfile for gateway-server
COPY ./gateway-server/package.json ./gateway-server/pnpm-lock.yaml ./gateway-server/

# Copy package.json and lockfile for sergo-shared
COPY ./sergo-shared/package.json ./sergo-shared/pnpm-lock.yaml ./sergo-shared/

# Install dependencies
RUN pnpm install --recursive

# Copy source code
COPY ./gateway-server ./gateway-server
COPY ./sergo-shared ./sergo-shared

# Build shared library first
RUN pnpm --filter sergo-shared build

# Build gateway-server
RUN pnpm --filter gateway-server build

# Production Stage
FROM node:alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy package.json and lockfile for production dependencies
COPY ./gateway-server/package.json ./gateway-server/pnpm-lock.yaml ./gateway-server/
COPY ./sergo-shared/package.json ./sergo-shared/pnpm-lock.yaml ./sergo-shared/

# Install production dependencies
RUN pnpm install --prod --recursive

# Copy built code from development stage
COPY --from=development /usr/src/app/gateway-server/dist ./gateway-server/dist
COPY --from=development /usr/src/app/sergo-shared/dist ./sergo-shared/dist

CMD ["pnpm", "run", "start:prod"]
