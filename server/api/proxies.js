'use strict';

const _ = require('lodash');
const config = require('config');

const {Proxy} = require('../service');
const HttpError = require('../lib/http_error');
const express = require('../lib/express');

let checkDomain = function (domain) {
  return domain !== config.domain;
};

let router = module.exports = express.Router();

router.get('/', function* (req, res) {
  let user_id = req.session.user.user_id;
  let list = yield Proxy.findAsync({user_id});
  res.json(list);
});

// 添加数据
router.post('/', function* (req, res) {
  // 判断域名合法性
  let domain = req.body.domain;
  if (domain && !checkDomain(domain)) {
    throw new HttpError(HttpError.FORBIDDEN, '域名不合法，请检查');
  }

  // TODO 数据冲突时的处理
  let options = _.assign(req.body, req.session.user);
  yield Proxy.addAsync(options);
  res.status(201).json({result: true});
});

// 修改修改
router.put('/', function* (req, res) {
  let user_id = req.session.user.user_id;
  let proxy_id = req.body.proxy_id;

  // 判断存在性及权限校验
  let proxy = yield Proxy.getAsync(proxy_id);
  if (!proxy || proxy.user_id !== user_id) {
    throw new HttpError(HttpError.NOT_FOUND, '数据未找到，请检查');
  }

  // 判断域名合法性
  let domain = req.body.domain;
  if (domain && !checkDomain(domain)) {
    throw new HttpError(HttpError.FORBIDDEN, '域名不合法，请检查');
  }

  // TODO 数据冲突时的处理
  yield Proxy.updateAsync(proxy_id, req.body);
  res.json({result: true});
});

// 删除
router.delete('/', function* (req, res) {
  let user_id = req.session.user.user_id;
  let proxy_id = req.query.proxy_id;

  // 判断存在性及权限校验
  let proxy = yield Proxy.getAsync(proxy_id);
  if (!proxy || proxy.user_id !== user_id) {
    throw new HttpError(HttpError.NOT_FOUND, '数据未找到，请检查');
  }

  yield Proxy.removeAsync(proxy_id);
  res.json({result: true});
});
