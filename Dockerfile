# Development Stage
FROM node:alpine AS development

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only the gateway-server's package.json and lockfile first
COPY ./gateway-server/package.json ./gateway-server/pnpm-lock.yaml ./

# Copy the shared repo's package.json and lockfile
COPY ./shared/package.json ./shared/pnpm-lock.yaml ./shared/

# Install dependencies for both gateway-server and shared repo
RUN pnpm install --recursive

# Copy the entire source code for both the gateway-server and shared repo
COPY ./gateway-server ./gateway-server
COPY ./shared ./shared

# Build both
RUN pnpm --filter ./shared build
RUN pnpm --filter ./gateway-server build

# Production Stage
FROM node:alpine AS production

WORKDIR /usr/src/app

# Set the environment to production
ENV NODE_ENV=production

# Copy package.json and lockfile for installing only production dependencies
COPY ./gateway-server/package.json ./gateway-server/pnpm-lock.yaml ./
COPY ./shared/package.json ./shared/pnpm-lock.yaml ./shared/

# Install only production dependencies
RUN pnpm install --prod --recursive

# Copy the built app from the development stage
COPY --from=development /usr/src/app/gateway-server/dist ./gateway-server/dist
COPY --from=development /usr/src/app/shared/dist ./shared/dist

CMD ["pnpm", "run", "start:prod"]
