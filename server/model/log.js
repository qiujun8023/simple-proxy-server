'use strict';

const Sequelize = require('sequelize');

const sequelize = require('../lib/sequelize');

module.exports = sequelize.define('log', {
  log_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '日志 ID',
  },
  proxy_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: '代理 ID',
  },
  ip: {
    type: Sequelize.STRING(15),
    allowNull: false,
    comment: '客户端 IP',
  },
  region: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
    comment: '所在地区',
  },
  city: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
    comment: '所在城市',
  },
  isp: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
    comment: '所属运营商',
  },
  is_complete: {
    type: Sequelize.ENUM,
    values: ['Y', 'N'],
    defaultValue: 'Y',
    allowNull: false,
    comment: '请求是否完成',
    get: function () {
      let is_complete = this.getDataValue('is_complete');
      return is_complete === 'Y';
    },
    set: function (is_complete) {
      this.setDataValue('is_complete', is_complete ? 'Y' : 'N');
    },
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: 'HTTP 状态码',
  },
  method: {
    type: Sequelize.ENUM,
    values: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'],
    allowNull: false,
    comment: 'HTTP 方法',
  },
  path: {
    type: Sequelize.TEXT,
    allowNull: false,
    comment: '请求路径',
  },
  ua: {
    type: Sequelize.TEXT,
    allowNull: false,
    comment: '客户端',
  },
  bytes: {
    type: Sequelize.BIGINT,
    allowNull: false,
    comment: '请求大小',
  },
  time: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    comment: '请求耗时',
  },
  speed: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    comment: '请求速度，单位 Kbps',
  },
}, {
  updatedAt: false,
  underscored: true,
  freezeTableName: true,
});
