# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY server.js .
EXPOSE 5173
CMD ["node", "server.js"]
