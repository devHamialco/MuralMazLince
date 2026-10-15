# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files from backend folder (repo root context)
COPY backend/package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy backend source code
COPY backend/. .

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files from backend folder (repo root context)
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy source code from builder stage (not node_modules)
COPY --from=builder /app/src ./src

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "src/app.js"]