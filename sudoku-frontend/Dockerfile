# sudoku-frontend-ts/Dockerfile

# ---- Build Stage ----
    FROM node:22-alpine AS build-stage
    WORKDIR /app
    COPY package*.json ./
    # Use npm install instead of npm ci
    RUN npm install
    COPY . .
    RUN npm run build
    
    # ---- Production Stage ----
    FROM nginx:1.25-alpine AS production-stage
    COPY --from=build-stage /app/dist /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]