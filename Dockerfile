FROM node:8.16.2 
LABEL maintainer Daniel Olivares "daniel.olivares@parkhub.com"

RUN mkdir /home/app

WORKDIR /home/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .
