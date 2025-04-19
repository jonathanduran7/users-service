# ---------- build stage ----------
FROM node:20 AS build
WORKDIR /app
    
COPY package*.json ./
RUN npm ci            
    
COPY . .
RUN npm run build     
    
# ---------- runtime stage ----------
FROM node:20-slim      
WORKDIR /app
ENV NODE_ENV=production
    
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
    
EXPOSE 3000
CMD ["node", "dist/main"]

# ---------- dev ----------
FROM node:20 AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
CMD ["npm","run","start:dev"]