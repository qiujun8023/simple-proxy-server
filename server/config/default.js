'use strict';

const path = require('path');

let config = {
  host: '127.0.0.1',
  domain: 'example.com',

  http: {
    port: 80,
  },

  https: {
    enable: true,
    port: 443,
    cert: path.join(__dirname, 'ssl/server.crt'),
    key: path.join(__dirname, 'ssl/server.key'),
  },

  env: 'development',
  debug: true,

  session: {
    secret: 'proxy_secret',
    name: 'session',
    maxAge: 60 * 60 * 24 * 30 * 1000,
  },

  redis: {
    host: '127.0.0.1',
    port: 6379,
    keyPrefix: 'proxy:',
  },

  mysql: {
    poolSize: 5,
    host: '127.0.0.1',
    user: 'proxy',
    password: 'password',
    database: 'proxy',
    timezone: '+08:00',
  },

  influx: {
    host: '127.0.0.1',
    port: 8086,
    protocol: 'http',
    username: '',
    password: '',
    database: 'proxy',
  },

  wechat: {
    corp_id: 'wx4e2c2b771c467c9f', // 企业号 CorpId
    secret: 'k7TGD8xJLDU6-sPH3NwY0eTs2oBPyAINMdbSbGN80fuEt01UK0Z8dWzhm7crgkz7',  // 企业号 Secret
    usertype: 'admin', // member(成员登录)、admin(管理员登录)、all(成员或管理员皆可登录)
  },

  access_log: {
    save_days: 180,
  },

  logger: {
    file: {
      filename: '/tmp/proxy.log',
    },
  },

  github: 'https://github.com/qious/simple-proxy',
  client_dir: path.join(__dirname, '../../client'),
};

module.exports = config;
