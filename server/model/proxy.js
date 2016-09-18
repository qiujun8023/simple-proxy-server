'use strict';

const Sequelize = require('sequelize');

const sequelize = require('../lib/sequelize')('proxy');

module.exports = sequelize.define('proxy', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '自增 id',
  },
  user_id: {
    type: Sequelize.STRING(30),
    comment: '用户 id',
  },
  mark: {
    type: Sequelize.STRING(60),
    allowNull: false,
    comment: '标记、名字',
  },
  domain: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    comment: '使用的域名',
  },
  hostname: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    comment: '回源域名',
  },
  target: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: '目标地址',
  },
  target_type: {
    type: Sequelize.ENUM,
    values: ['HTTP', 'HTTPS'],
    defaultValue: 'HTTP',
    allowNull: false,
    comment: '目标地址类型',
  },
  proxy_type: {
    type: Sequelize.ENUM,
    values: ['BOTH', 'HTTP_ONLY', 'HTTPS_ONLY'],
    defaultValue: 'HTTP_ONLY',
    allowNull: false,
    comment: '目标地址类型',
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
