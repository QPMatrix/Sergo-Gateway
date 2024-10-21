# Development Stage
FROM node:alpine AS development

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only package.json and lockfile first to improve caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install -r

# Copy the rest of the application code
COPY . .

# Build the app
RUN pnpm run build


# Production Stage
FROM node:alpine AS production

# Set the environment to production
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only what's needed for production
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN npm install -g pnpm
RUN pnpm install --prod

# Copy the built app from the development stage
COPY --from=development /usr/src/app/dist ./dist

# Start the application
CMD ["node", "dist/main"]
