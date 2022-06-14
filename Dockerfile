FROM node
WORKDIR /app
COPY . .
RUN npm install
RUN npm install webpack typescript jquery
ENTRYPOINT ["./start.sh"]
