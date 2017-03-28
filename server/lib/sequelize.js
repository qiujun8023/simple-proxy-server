'use strict';

const config = require('config');
const Sequelize = require('sequelize');

let {host, database, user, password, poolSize, timezone} = config.mysql;
module.exports = new Sequelize(database, user, password, {
  host,
  timezone,
  dialect: 'mysql',
  pool: {
    max: poolSize,
    min: 0,
    idle: 10000,
  },
  logging: false,
});
