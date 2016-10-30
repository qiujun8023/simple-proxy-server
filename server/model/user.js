'use strict';

const Sequelize = require('sequelize');

const sequelize = require('../lib/sequelize')('proxy');

module.exports = sequelize.define('user', {
  user_id: {
    type: Sequelize.STRING(30),
    allowNull: false,
    primaryKey: true,
    comment: '用户 id',
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: '姓名',
  },
  gender: {
    type: Sequelize.ENUM,
    values: ['UNKNOWN', 'MAN', 'WOMAN'],
    defaultValue: 'UNKNOWN',
    allowNull: false,
    comment: '性别',
    get: function () {
      let transform = {
        UNKNOWN: '未知',
        MAN: '男',
        WOMAN: '女',
      };
      let gender = this.getDataValue('gender');
      return transform[gender];
    },
    set: function (gender) {
      if (gender === '男') {
        gender = 'MAN';
      } else if (gender === '女') {
        gender = 'WOMAN';
      } else {
        gender = 'UNKNOWN';
      }
      this.setDataValue('gender', gender);
    },
  },
  mobile: {
    type: Sequelize.STRING(20),
    allowNull: false,
    comment: '手机',
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: '邮箱',
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: '头像',
  },
  is_locked: {
    type: Sequelize.ENUM,
    values: ['Y', 'N'],
    defaultValue: 'N',
    allowNull: false,
    comment: '是否禁用',
    get: function () {
      let is_locked = this.getDataValue('is_locked');
      return is_locked === 'Y';
    },
    set: function (is_locked) {
      this.setDataValue('is_locked', is_locked ? 'Y' : 'N');
    },
  },
}, {
  createdAt: 'regist_at',
  updatedAt: 'login_at',
  underscored: true,
  freezeTableName: true,
});
