# -------------------------------------------------------------
# boshqar.uz Frontend Dockerfile (Vue 3 + Vite + Nginx Alpine)
# -------------------------------------------------------------

FROM node:20-alpine AS builder

WORKDIR /app

COPY ubms-shared-types ./ubms-shared-types
RUN cd ubms-shared-types && npm ci && npm run build

COPY ubms-frontend ./ubms-frontend
WORKDIR /app/ubms-frontend

RUN npm ci
RUN npm run build

# Nginx Production Server
FROM nginx:1.25-alpine

COPY --from=builder /app/ubms-frontend/dist /usr/share/nginx/html
COPY ubms-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
