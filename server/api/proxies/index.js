'use strict';

const _ = require('lodash');
const config = require('config');
const {Proxy} = require('../../service');
const HttpError = require('../../lib/http_error');
const express = require('../../lib/express');

let router = module.exports = express.Router();

// 获取用户ID
let getUserId = function (req) {
  let {user_id, is_admin} = req.session.user;
  if (is_admin && req.query.user_id) {
    return req.query.user_id;
  }
  return user_id;
};

let checkDomain = function (domain) {
  if (domain === config.domain) {
    throw new HttpError(HttpError.FORBIDDEN, '域名不合法，请检查');
  }
  return true;
};

// 访问权限检查
let getProxyAsync = function* (user, proxy_id) {
  let proxy = yield Proxy.getAsync(proxy_id);
  if (!user.is_admin && user.user_id !== proxy.user_id) {
    throw new HttpError(HttpError.NOT_FOUND, '数据未找到');
  }

  return proxy;
};

// 获取代理列表
router.get('/', function* (req, res) {
  let user_id = getUserId(req);
  let list = yield Proxy.findAsync({user_id});
  res.json(list);
});

// 获取代理详情
router.get('/:proxy_id', function* (req, res) {
  let proxy = yield getProxyAsync(req.session.user, req.params.proxy_id);
  res.send(proxy);
});

// 添加代理
router.post('/', function* (req, res) {
  // 判断域名合法性
  let {domain} = req.body;
  if (!domain) {
    throw new HttpError(HttpError.BAD_REQUEST, '域名不能为空');
  }
  checkDomain(domain);

  try {
    let options = _.assign(req.body, req.session.user);
    let proxy = yield Proxy.addAsync(options);
    res.status(201).json(proxy);
  } catch (err) {
    throw new HttpError(HttpError.BAD_REQUEST, '添加失败，可能域名已被使用');
  }
});

// 修改代理
router.put('/', function* (req, res) {
  let {proxy_id} = req.body;

  // 存在性与所有者检查
  yield getProxyAsync(req.session.user, proxy_id);
  // 域名合法性检查
  checkDomain(req.body.domain);

  try {
    let proxy = yield Proxy.updateAsync(proxy_id, req.body);
    res.json(proxy);
  } catch (err) {
    throw new HttpError(HttpError.BAD_REQUEST, '添加失败，可能域名已被使用');
  }

});

// 删除代理
router.delete('/', function* (req, res) {
  let {proxy_id} = req.query;

  // 存在性与所有者检查
  yield getProxyAsync(req.session.user, proxy_id);

  // 删除数据
  yield Proxy.removeAsync(proxy_id);
  res.status(200).send({result: true});
});
