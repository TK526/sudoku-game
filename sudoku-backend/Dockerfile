# sudoku-backend/Dockerfile

# ---- Base Node ----
    FROM node:22-alpine AS base
    WORKDIR /usr/src/app
    
    # ---- Dependencies ----
    # Install ONLY production dependencies here using npm install
    FROM base AS prod-deps
    COPY package*.json ./
    # Use npm install with --omit=dev flag
    RUN npm install --omit=dev
    
    # ---- Build ----
    # Install ALL dependencies (including dev) for building using npm install
    FROM base AS build
    COPY package*.json ./
    # Use npm install
    RUN npm install
    COPY . .
    RUN npm run build
    
    # ---- Release ----
    FROM base AS release
    WORKDIR /usr/src/app
    # Copy PRODUCTION node_modules from the 'prod-deps' stage
    COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
    # Copy the built application from the 'build' stage
    COPY --from=build /usr/src/app/dist ./dist
    # Copy package.json (optional)
    COPY package.json ./package.json
    
    EXPOSE 3000
    CMD node dist/src/main