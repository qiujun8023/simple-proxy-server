'use strict';

const tls = require('tls');

const _ = require('lodash');
const config = require('config');

const redis = require('../lib/redis')('proxy');
const ProxyModel = require('../model').Proxy;
const UserModel = require('../model').User;

exports = module.exports = {};

exports.SNIAsync = function* (domain) {
  let key;
  let cert;

  if (domain === config.domain) {
    key = config.https.key;
    cert = config.https.cert;
  } else {
    let proxy = yield this.getNormalByDomainAsync(domain);
    key = proxy.key;
    cert = proxy.cert;
  }

  return tls.createSecureContext({key, cert});
};

// 统一前缀
exports._cachePrefix = 'domain:';

// 通过域名设置代理缓存
exports._setCacheByDomainAsync = function* (domain, options) {
  let key = this._cachePrefix + domain;
  return yield redis.set(key, JSON.stringify(options), 'EX', 300);
};

// 通过域名删除代理缓存
exports._removeCacheByDomainAsync = function* (domain) {
  let key = this._cachePrefix + domain;
  return yield redis.del(key);
};

// 通过域名读取代理缓存
exports._getCacheByDomainAsync = function* (domain) {
  let key = this._cachePrefix + domain;
  return JSON.parse(yield redis.get(key));
};

// 增加代理
exports.addAsync = function* (options) {
  let proxy = yield ProxyModel.create(options);
  return _.isEmpty(proxy) ? false : proxy.proxy_id;
};

// 删除代理
exports.removeAsync = function* (proxy_id) {
  let proxy = yield this._getAsync(proxy_id);
  if (_.isEmpty(proxy)) {
    return true;
  }

  // 删除缓存
  yield this._removeCacheByDomainAsync(proxy.domain);
  return proxy.destroy();
};

// 更新代理
exports.updateAsync = function* (proxy_id, options) {
  let proxy = yield this._getAsync(proxy_id);
  if (_.isEmpty(proxy)) {
    return false;
  }

  proxy = yield proxy.update(options);
  proxy = proxy.get({plain: true});

  // 更新缓存
  yield this._setCacheByDomainAsync(proxy.domain, proxy);
  return proxy;
};

// 通过主键查询
exports._getAsync = function* (proxy_id) {
  return yield ProxyModel.findById(proxy_id, {
    include: [UserModel],
  });
};

// 通过主键查询
exports.getAsync = function* (proxy_id) {
  let proxy = yield this._getAsync(proxy_id);
  if (_.isEmpty(proxy)) {
    return false;
  }

  return proxy.get({plain: true});
};

// 通过域名查询可以提供代理
exports.getNormalByDomainAsync = function* (domain, dont_cache) {
  let proxy = yield this.getByDomainAsync(domain, dont_cache);
  if (!proxy) {
    return false;
  } else if (proxy.is_paused) {
    return false;
  } else if (proxy.user && proxy.user.is_locked) {
    return false;
  }

  return proxy;
};

// 通过域名查询
exports.getByDomainAsync = function* (domain, dont_cache) {
  // 从缓存中读取
  if (!dont_cache) {
    let cache = yield this._getCacheByDomainAsync(domain);
    if (cache) {
      cache.is_cache = true;
      return cache;
    }
  }

  // 从数据中查询
  let proxy = yield ProxyModel.findOne({
    where: {domain},
    include: [UserModel],
  });
  if (_.isEmpty(proxy)) {
    return false;
  }

  // 写入缓存
  proxy = proxy.get({plain: true});
  yield this._setCacheByDomainAsync(proxy.domain, proxy);

  proxy.is_cache = false;
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
