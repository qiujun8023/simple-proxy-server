'use strict';

const _ = require('lodash');
const config = require('config');

const errors = require('../lib/errors');
const ProxyService = require('../service').Proxy;

let action = module.exports = {};

// 权限校验
action.auth = function (req, res, next) {
  let user_id = req.get('x-user-id');
  if (user_id) {
    req.session.user = req.session.user || {};
    req.session.user.user_id = user_id;
  }

  let user = req.session.user || {};
  if (!user.user_id) {
    throw new errors.Unauthorized('您需要登陆登陆才能访问');
  }
  next();
};

// 检查域名合法性
action._checkDomain = function (domain) {
  if (domain === config.domain) {
    return false;
  }
  return true;
};

// 查
action.get = function* (req, res) {
  let user = req.session.user;
  let list = yield ProxyService.findAsync({user_id: user.user_id});
  res.json({user, list});
};

// 改
action.post = function* (req, res) {
  let user_id = req.session.user.user_id;
  let proxy_id = req.body.proxy_id;

  // 判断数据存在及是否拥有修改权限
  let proxy = yield ProxyService.getAsync(proxy_id);
  if (!proxy || proxy.user_id !== user_id) {
    throw new errors.NotFound('数据未找到，请检查');
  }

  // 判断域名合法性
  let domain = req.body.domain;
  if (domain && !action._checkDomain(domain)) {
    throw new errors.Forbidden('域名不合法，请检查');
  }

  // 修改数据
  // TODO 数据冲突时的处理
  yield ProxyService.updateAsync(proxy_id, req.body);
  res.json({result: true});
};

// 增
action.put = function* (req, res) {
  // 判断域名合法性
  let domain = req.body.domain;
  if (domain && !action._checkDomain(domain)) {
    throw new errors.Forbidden('域名不合法，请检查');
  }

  // 增加数据
  // TODO 数据冲突时的处理
  let options = _.assign(req.body, req.session.user);
  yield ProxyService.addAsync(options);
  res.status(201).json({result: true});
};

// 删
action.delete = function* (req, res) {
  let user_id = req.session.user.user_id;
  let proxy_id = req.query.proxy_id;

  // 判断数据存在及是否拥有修改权限
  let proxy = yield ProxyService.getAsync(proxy_id);
  if (!proxy || proxy.user_id !== user_id) {
    throw new errors.NotFound('数据未找到，请检查');
  }

  // 删除数据
  yield ProxyService.removeAsync(proxy_id);
  res.json({result: true});
};
