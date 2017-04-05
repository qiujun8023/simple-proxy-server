'use strict';

const path = require('path');

let config = {
  env: 'test',
  debug: false,

  http: {
    port: 8080,
  },

  https: {
    enable: true,
    port: 8443,
    cert: path.join(__dirname, 'ssl/server.crt'),
    key: path.join(__dirname, 'ssl/server.key'),
  },

  mysql: {
    poolSize: 5,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'proxy',
    timezone: '+08:00',
  },
};

module.exports = config;
