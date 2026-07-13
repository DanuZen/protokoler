FROM node:22-slim

# Install openssl and ca-certificates for Prisma compatibility
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend package configuration
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy backend source files
COPY backend/ ./

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Hugging Face Spaces port configuration
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Run migrations and start the backend
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
