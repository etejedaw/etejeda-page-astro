FROM node:krypton-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:krypton-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG GHOST_URL
ARG GHOST_CONTENT_API_KEY
ENV GHOST_URL=$GHOST_URL
ENV GHOST_CONTENT_API_KEY=$GHOST_CONTENT_API_KEY
RUN npm run build

FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
