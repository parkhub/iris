FROM node:8.8.0 
LABEL maintainer Daniel Olivares "daniel.olivares@parkhub.com"

ENV TINI_VERSION v0.16.1
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

RUN mkdir /home/app

WORKDIR /home/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENTRYPOINT ["/tini", "--"]
