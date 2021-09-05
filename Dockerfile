#Build stage
FROM node:14-slim

RUN mkdir /build-app

COPY . /build-app

WORKDIR /build-app

RUN yarn install

RUN yarn build

#Production stage
FROM nginx:alpine

RUN mkdir /app

COPY --from=0 /build-app/dist /app

COPY ./config_nginx.conf /etc/nginx/nginx.conf

EXPOSE 80