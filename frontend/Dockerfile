# Frontend Dockerfile for Development with Hot Reload
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
