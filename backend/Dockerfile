FROM node:18-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci

COPY backend/. .

FROM node:18-alpine AS production

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/app.js"]