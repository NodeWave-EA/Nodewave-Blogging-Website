# Backend Dockerfile for Development with Live Reload
FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose Strapi port
EXPOSE 1337

# Start Strapi in development mode with auto-reload
CMD ["npm", "run", "develop"]
