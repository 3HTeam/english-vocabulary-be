# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema (Bắt buộc để generate client)
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build app
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Cài đặt OpenSSL
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Copy prisma schema
COPY prisma ./prisma

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma client
RUN npx prisma generate

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8000

# Start app: Chạy Migration trước -> Nếu thành công mới Start App
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/main"]