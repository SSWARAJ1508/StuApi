# Use official Node.js LTS Alpine image for a lightweight, secure footprint
FROM node:20-alpine

# Set environment variable for production
ENV NODE_ENV=production

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly and deterministically
RUN npm ci --omit=dev

# Copy application source code with non-root ownership
COPY --chown=node:node . .

# Run application as the non-root node user provided by the official image
USER node

# Expose the API server port
EXPOSE 3000

# Start the Express server
CMD ["node", "src/server.js"]

