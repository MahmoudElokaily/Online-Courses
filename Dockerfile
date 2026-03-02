# Base stage
FROM node:25-alpine as base
# Make dir to work on it
WORKDIR /online-course
# Install pnpm
RUN npm install -g pnpm
# Copy packages dependencies first (for caching)
COPY package.json pnpm-lock.yaml ./
# PNPM Install
RUN pnpm i
# Copy files to workdir
COPY . .

# Run build
FROM base as build
RUN pnpm run build

# Testing stage
FROM base as testing

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]

# Production stage
FROM node:25-alpine AS production
ENV NODE_ENV=production
# Make dir to work on it
WORKDIR /online-course
# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod

COPY --from=build /online-course/dist ./dist
# Install wget
RUN apk add --no-cache wget
# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /online-course

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

EXPOSE 3000

CMD ["node", "dist/main.js"]


