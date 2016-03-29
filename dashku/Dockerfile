FROM ubuntu:14.04

MAINTAINER Anephenix

RUN apt-get update
RUN apt-get install -y software-properties-common git
RUN add-apt-repository ppa:chris-lea/node.js 
RUN apt-get update
RUN apt-get install -y build-essential nodejs libssl-dev python

ENV NODE_ENV docker

ADD ./ /dashku
WORKDIR /dashku

RUN npm install

EXPOSE 3000

CMD npm start