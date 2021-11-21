FROM node:6.14.2-slim
RUN apt-get update && apt-get install -y git
WORKDIR /srv/kai
COPY . .
EXPOSE 3000
RUN npm install && npm run ts && npm run downloaddata
RUN npm install http-server -g && cat LICENSE
CMD ["npm", "serve"]