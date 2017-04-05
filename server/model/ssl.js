'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../lib/sequelize');

module.exports = sequelize.define('ssl', {
  ssl_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '自增 id',
  },
  proxy_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
    comment: '代理 id',
  },
  cert: {
    type: Sequelize.TEXT,
    comment: '证书',
  },
  key: {
    type: Sequelize.TEXT,
    comment: '私钥',
  },
}, {
  underscored: true,
  freezeTableName: true,
});
