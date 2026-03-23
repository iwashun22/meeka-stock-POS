# Build stage
FROM node:24-alpine3.22 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install \
    && npm install nodemon

COPY . .
RUN npm run bundle

# Production stage
FROM node:24-alpine3.22
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY icons ./icons
COPY lib ./lib
COPY middleware ./middleware
COPY public ./public
COPY routes ./routes
COPY util ./util
COPY views ./views

COPY --from=builder /app/public/dist ./public/dist
COPY app.cjs ./

CMD ["node", "app.cjs"]