FROM node:18-alpine

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

# Run migrations and start app
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
