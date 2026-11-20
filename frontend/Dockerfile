# ---- Build stage: compile the React app ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage: nginx serves the build and proxies /api to the backend ----
FROM nginx:1.27-alpine
# Files in /etc/nginx/templates are run through envsubst at start-up.
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Where /api requests are forwarded. In docker-compose this is the backend service.
ENV BACKEND_URL=http://backend:8080
EXPOSE 80
