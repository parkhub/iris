FROM node:8.5-alpine 
LABEL maintainer Daniel Olivares "daniel.olivares@parkhub.com"

RUN apk add --update --upgrade --no-cache git
RUN mkdir /npm-module
WORKDIR /npm-module

RUN apk --update --upgrade add \
  cyrus-sasl-dev \
  make \
  gcc \
  g++ \
  bash \
  python \
  libressl2.5-libcrypto \
  libressl2.5-libssl \
  librdkafka-dev=0.9.5-r0 \ 
  git \
  ca-certificates \
  wget \
  && wget -O /etc/apk/keys/sgerrand.rsa.pub https://raw.githubusercontent.com/sgerrand/alpine-pkg-glibc/master/sgerrand.rsa.pub \
  && wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.25-r0/glibc-2.25-r0.apk \
  && apk add glibc-2.25-r0.apk

ENV WITH_SASL 0
ENV BUILD_LIBRDKAFKA 0

COPY package.json package-lock.json ./

RUN npm install 

COPY . .
