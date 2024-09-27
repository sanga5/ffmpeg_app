
FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN apt-get update && apt-get install ffmpeg -y
RUN npm install fluent-ffmpeg
RUN npm install express

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
