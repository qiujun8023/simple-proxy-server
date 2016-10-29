'use strict';

const _ = require('lodash');

const UserModel = require('../model').User;

exports = module.exports = {};

// 通过微信信息添加用户
exports.addByWechatAsync = function* (options) {
  let gender = ['未知', '男', '女'];
  options = {
    user_id: options.userid,
    name: options.name,
    gender: gender[options.gender],
    mobile: options.mobile || '',
    email: options.email || '',
    avatar: options.avatar || '',
  };
  return yield this.upsertAsync(options);
};

// 增加或更新
exports.upsertAsync = function* (options) {
  yield UserModel.upsert(options);
  return options.user_id;
};

// 更新用户
exports.updateAsync = function* (user_id, options) {
  let user = yield this._getAsync(user_id);
  if (_.isEmpty(user)) {
    return false;
  }

  user = yield user.update(options);
  return user.get({plain: true});
};

// 禁用用户
exports.lockAsync = function* (user_id) {
  let user = yield this.updateAsync(user_id, {state: 'LOCKED'});
  return !_.isEmpty(user);
};

// 启用用户
exports.unlockAsync = function* (user_id) {
  let user = yield this.updateAsync(user_id, {state: 'NORMAL'});
  return !_.isEmpty(user);
};

// 通过主键查询
exports._getAsync = function* (user_id) {
  return yield UserModel.findById(user_id);
};

// 通过主键查询
exports.getAsync = function* (user_id) {
  let user = yield this._getAsync(user_id);
  if (_.isEmpty(user)) {
    return false;
  }

  return user.get({plain: true});
};
