FROM node:22-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/. .

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci --omit=dev

COPY backend/src ./src
COPY backend/scripts ./scripts
COPY docs/swagger.json ./docs/swagger.json
COPY --from=frontend-builder /frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/app.js"]
