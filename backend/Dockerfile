# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps

WORKDIR /app

# Copy only package files first for optimal layer caching
COPY package.json package-lock.json ./

# Install production dependencies only (no devDependencies)
RUN npm ci --omit=dev

# ---- Stage 2: Production image ----
FROM node:22-alpine AS production

WORKDIR /app

# Add tini for proper PID 1 signal handling
RUN apk add --no-cache tini

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY package.json ./
COPY server.js ./
COPY socket.js ./
COPY routes/ ./routes/
COPY models/ ./models/
COPY middleware/ ./middleware/

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose backend port
EXPOSE 3000

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the server
CMD ["node", "server.js"]
