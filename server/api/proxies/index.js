'use strict';

const _ = require('lodash');
const config = require('config');
const {Proxy, Ssl} = require('../../service');
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
  let {proxy_id} = req.params;
  let proxy = yield getProxyAsync(req.session.user, proxy_id);
  proxy.ssl = {uploaded: Boolean(yield Ssl.getByProxyIdAsync(proxy_id))};
  res.send(proxy);
});

// 添加代理
router.post('/', function* (req, res) {
  // 过滤请求参数
  let filter = [
    'mark', 'domain', 'hostname', 'target',
    'target_type', 'proxy_type', 'is_enabled',
  ];
  let options = _.pick(req.body, filter);

  // 允许管理员为其他用户创建代理
  options.user_id = req.session.user.user_id;
  if (req.session.user.is_admin && req.body.user_id) {
    options.user_id = req.body.user_id;
  }

  // 判断域名合法性
  if (!options.domain) {
    throw new HttpError(HttpError.BAD_REQUEST, '域名不能为空');
  }
  checkDomain(options.domain);

  try {
    let proxy = yield Proxy.addAsync(options);

    // 证书写入数据库
    let {cert, key} = req.body.ssl || {};
    if (cert && key) {
      let proxy_id = proxy.proxy_id;
      yield Ssl.upsertAsync({proxy_id, cert, key});
      proxy.ssl = {uploaded: true};
    } else {
      proxy.ssl = {uploaded: false};
    }

    res.status(201).json(proxy);
  } catch (err) {
    throw new HttpError(HttpError.BAD_REQUEST, '添加失败，可能域名已被使用');
  }
});

// 修改代理
router.put('/:proxy_id', function* (req, res) {
  // 过滤请求参数
  let filter = [
    'mark', 'domain', 'hostname', 'target',
    'target_type', 'proxy_type', 'is_enabled',
  ];
  let options = _.pick(req.body, filter);
  let {proxy_id} = req.params;

  // 存在性与所有者检查
  yield getProxyAsync(req.session.user, proxy_id);
  // 域名合法性检查
  checkDomain(req.body.domain);

  try {
    let proxy = yield Proxy.updateAsync(proxy_id, options);

    // 更新证书信息
    let {cert, key} = req.body.ssl || {};
    if (cert && key) {
      yield Ssl.upsertAsync({proxy_id, cert, key});
      proxy.ssl = {uploaded: true};
    } else {
      proxy.ssl = {uploaded: Boolean(yield Ssl.getByProxyIdAsync(proxy_id))};
    }

    res.json(proxy);
  } catch (err) {
    throw new HttpError(HttpError.BAD_REQUEST, '修改失败，可能域名已被使用');
  }
});

// 删除代理
router.delete('/:proxy_id', function* (req, res) {
  let {proxy_id} = req.params;

  // 存在性与所有者检查
  yield getProxyAsync(req.session.user, proxy_id);

  // 删除数据
  yield Proxy.removeAsync(proxy_id);
  res.status(200).send({result: true});
});
