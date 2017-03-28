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

  proxy_log: {
    save_days: 30, // 访问日志保存天数，为 0 则不保存
    cron: { // 格式为 秒 分 时 天 月 星期
      set_location: '0 */5 * * * *', // 更新数据库中 IP 所在地
      data_clean: '0 3 * * * *',     // 清理过期日志
    },
  },

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

  wechat: {
    corp_id: 'corp_id', // 企业号 CorpId
    secret: 'secret',  // 企业号 Secret
    usertype: 'admin', // member(成员登录)、admin(管理员登录)、all(成员或管理员皆可登录)
  },

  logger: {
    file: {
      filename: '/tmp/proxy.log',
    },
  },

  client_dir: path.join(__dirname, '../../client'),
};

module.exports = config;
