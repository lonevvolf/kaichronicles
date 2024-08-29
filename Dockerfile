FROM node:18.5.0-slim
RUN apt-get update && apt-get install -y zip && apt-get install -y git
WORKDIR /srv/kai
COPY . .
EXPOSE 8080
RUN npm install && npm run downloaddata && npm run dist
RUN npm install http-server -g && cat LICENSE
CMD ["http-server", "./www"]