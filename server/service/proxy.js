'use strict';

const fs = require('fs');
const tls = require('tls');

const _ = require('lodash');
const config = require('config');

const redis = require('../lib/redis')('proxy');
const ProxyModel = require('../model').Proxy;
const UserModel = require('../model').User;

exports = module.exports = {};

if (config.https.enable) {
  exports._key = fs.readFileSync(config.https.key);
  exports._cert = fs.readFileSync(config.https.cert);
}

exports.SNIAsync = function* (domain) {
  if (domain === config.domain) {
    return tls.createSecureContext({
      key: exports._key,
      cert: exports._cert,
    });
  }

  let proxy = yield this.getNormalByDomainAsync(domain);
  return tls.createSecureContext({
    key: proxy.key,
    cert: proxy.cert,
  });
};

// 统一前缀
exports._cachePrefix = 'domain:';

// 通过域名设置代理缓存
exports._setCacheByDomainAsync = function* (domain, data) {
  let cache_key = this._cachePrefix + domain;
  return yield redis.set(cache_key, JSON.stringify(data), 'EX', 300);
};

// 通过域名删除代理缓存
exports._removeCacheByDomainAsync = function* (domain) {
  let cache_key = this._cachePrefix + domain;
  return yield redis.del(cache_key);
};

// 通过域名读取代理缓存
exports._getCacheByDomainAsync = function* (domain) {
  let cache_key = this._cachePrefix + domain;
  let cache = yield redis.get(cache_key);
  return cache ? JSON.parse(cache) : null;
};

// 增加代理
exports.addAsync = function* (data) {
  let proxy = yield ProxyModel.create(data);
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
exports.updateAsync = function* (proxy_id, data) {
  let proxy = yield this._getAsync(proxy_id);
  if (_.isEmpty(proxy)) {
    return false;
  }

  proxy = yield proxy.update(data);
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
exports.findAsync = function* (where) {
  let list = yield ProxyModel.findAll({where});
  if (_.isEmpty(list)) {
    return [];
  }

  let res = [];
  for (let item of list) {
    res.push(item.get({plain: true}));
  }
  return res;
};
