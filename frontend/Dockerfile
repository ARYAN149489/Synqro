# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps

WORKDIR /app

# Copy only package files first for optimal layer caching
COPY package.json package-lock.json ./

# Install all dependencies (devDeps needed for build)
RUN npm ci

# ---- Stage 2: Build the application ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build argument for the backend URL (baked into the static bundle)
ARG VITE_BACKEND_URL=http://localhost:3000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build production bundle
RUN npm run build

# ---- Stage 3: Serve with nginx ----
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
