'use strict';

const tls = require('tls');

const _ = require('lodash');
const config = require('config');

const redis = require('../lib/redis')('proxy');
const ProxyModel = require('../model').Proxy;

exports = module.exports = {};

exports.SNIAsync = function* (domain) {
  let key;
  let cert;

  if (domain === config.domain) {
    key = config.https.key;
    cert = config.https.cert;
  } else {
    let proxy = yield this.getByDomainAsync(domain);
    key = proxy.key;
    cert = proxy.cert;
  }

  return tls.createSecureContext({key, cert});
};

// 通过域名设置缓存
exports._setCacheByDomainAsync = function* (domain, options) {
  return yield redis.set(domain, JSON.stringify(options));
};

// 通过域名删除缓存
exports._removeCacheByDomainAsync = function* (domain) {
  return yield redis.del(domain);
};

// 通过域名读取缓存
exports._getCacheByDomainAsync = function* (domain) {
  return JSON.parse(yield redis.get(domain));
};

// 增加
exports.addAsync = function* (options) {
  let proxy = yield ProxyModel.create(options);
  return _.isEmpty(proxy) ? false : proxy.id;
};

// 删
exports.removeAsync = function* (id) {
  let proxy = yield this._getAsync(id);
  if (_.isEmpty(proxy)) {
    return true;
  }

  // 删除缓存
  yield this._removeCacheByDomainAsync(proxy.domain);
  return proxy.destroy();
};

// 改
exports.updateAsync = function* (id, options) {
  let proxy = yield this._getAsync(id);
  if (_.isEmpty(proxy)) {
    return false;
  }

  proxy = yield proxy.update(options);
  proxy = proxy.get({plain: true});

  // 更新缓存
  yield this._setCacheByDomainAsync(proxy.domain, proxy);
  return proxy;
};

// 查
exports._getAsync = function* (id) {
  return yield ProxyModel.findOne({
    where: {id},
  });
};

// 通过 ID 获取一个结果
exports.getAsync = function* (id) {
  let proxy = yield this._getAsync(id);
  if (_.isEmpty(proxy)) {
    return false;
  }

  return proxy.get({plain: true});
};

// 通过域名获取一个结果
exports.getByDomainAsync = function* (domain, dont_cache) {
  // 从缓存中读取
  if (!dont_cache) {
    let cache = yield this._getCacheByDomainAsync(domain);
    if (cache) {
      cache.is_cache = true;
      return cache;
    }
  }

  let proxy = yield ProxyModel.findOne({
    where: {domain},
  });
  if (_.isEmpty(proxy)) {
    return false;
  }

  // 写入缓存
  proxy = proxy.get({plain: true});
  yield this._setCacheByDomainAsync(proxy.domain, proxy);
  return proxy;
};

// 获取多个结果
exports.findAsync = function* (options) {
  let list = yield ProxyModel.findAll({
    where: options,
  });
  if (_.isEmpty(list)) {
    return [];
  }

  let res = [];
  for (let item of list) {
    res.push(item.get({plain: true}));
  }
  return res;
};
