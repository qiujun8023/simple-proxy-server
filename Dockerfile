FROM node:4.4.4
MAINTAINER qiujun i@qiujun.me

RUN npm config set registry https://registry.npm.taobao.org
RUN npm install -g pm2 && pm2 dump

COPY . /app
WORKDIR /app
RUN npm install

EXPOSE 80 443

CMD ["pm2", "start", "pm2.json", "--no-daemon"]
