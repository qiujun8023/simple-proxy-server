'use strict';

let config = {
  env: 'test',
  debug: false,

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
