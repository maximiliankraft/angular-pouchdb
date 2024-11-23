# Stage 1: Build the Angular app
FROM node AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

COPY --from=build /app/dist/demo/browser /usr/share/nginx/html

# Copy the default nginx.conf provided by Nginx
COPY nginx.conf /etc/nginx/nginx.conf
