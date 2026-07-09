FROM node:22-slim

# Install openssl and ca-certificates for Prisma compatibility
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Set directory
WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install packages
RUN npm ci

# Copy all source files
COPY . .

# Generate Prisma client for Postgres
RUN npx prisma generate

# Build NestJS production assets
RUN npm run build

# Hugging Face Spaces default port is 7860
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Run migrations and start app (removed redundant npm run build)
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
