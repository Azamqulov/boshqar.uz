# -------------------------------------------------------------
# boshqar.uz Backend Dockerfile (NestJS + Prisma + Node.js 20 Alpine)
# -------------------------------------------------------------

FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install dependencies for shared types and backend
COPY ubms-shared-types ./ubms-shared-types
RUN cd ubms-shared-types && npm install && npm run build

COPY ubms-backend ./ubms-backend
WORKDIR /app/ubms-backend

RUN npm install
RUN npx prisma generate
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app/ubms-backend

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/ubms-shared-types /app/ubms-shared-types
COPY --from=builder /app/ubms-backend/package*.json ./
COPY --from=builder /app/ubms-backend/node_modules ./node_modules
COPY --from=builder /app/ubms-backend/dist ./dist
COPY --from=builder /app/ubms-backend/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/src/main.js"]
