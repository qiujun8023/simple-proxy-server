'use strict';

const redis = require('../lib/redis');
const ProxyModel = require('../model').Proxy;
const UserModel = require('../model').User;

let Proxy = module.exports = {};

// 缓存前缀
Proxy._cache_prefix = 'proxy:';

// 获取缓存 Key
Proxy.getCacheKeyByDomain = function (domain) {
  return this._cache_prefix + domain;
};

// 通过域名获取缓存
Proxy.getCacheByDomainAsync = function* (domain) {
  let cache_key = this.getCacheKeyByDomain(domain);
  let cache = yield redis.get(cache_key);
  return cache ? JSON.parse(cache) : null;
};

// 通过域名设置缓存
Proxy.setCacheByDomainAsync = function* (domain, data) {
  let cache_key = this.getCacheKeyByDomain(domain);
  return yield redis.set(cache_key, JSON.stringify(data), 'EX', 300);
};

// 通过域名删除缓存
Proxy.removeCacheByDomainAsync = function* (domain) {
  let cache_key = this.getCacheKeyByDomain(domain);
  return yield redis.del(cache_key);
};

// 通过主键查询
Proxy.getAsync = function* (proxy_id) {
  let proxy = yield ProxyModel.findById(proxy_id);
  if (!proxy) {
    return false;
  }

  return proxy.get({plain: true});
};

// 通过 domain 获取代理信息（查询缓存）
Proxy.getByDomainAsync = function* (domain, with_disabled) {
  let proxy = yield ProxyModel.findOne({
    where: {domain},
    include: [UserModel],
  });

  if (!proxy) {
    return false;
  }

  proxy = proxy.get({plain: true});
  if (!with_disabled) {
    if (!proxy.is_enabled) {
      return false;
    } else if (!proxy.user || proxy.user.is_locked) {
      return false;
    }
  }

  delete proxy.user;
  return proxy;
};

// 通过 domain 获取代理信息
Proxy.getWithCacheByDomainAsync = function* (domain, with_disabled) {
  // 从缓存中读取
  let proxy = yield this.getCacheByDomainAsync(domain);

  // 从数据中查询
  if (!proxy) {
    proxy = yield this.getByDomainAsync(domain, with_disabled);
  }

  if (!proxy) {
    return false;
  }

  // 写入缓存
  yield this.setCacheByDomainAsync(proxy.domain, proxy);

  return proxy;
};

// 获取代理列表
Proxy.findAsync = function* (where) {
  let proxies = yield ProxyModel.findAll({where});

  let res = [];
  for (let proxy of proxies) {
    proxy = proxy.get({plain: true});
    res.push(proxy);
  }
  return res;
};

// 增加代理
Proxy.addAsync = function* (data) {
  let proxy = yield ProxyModel.create(data);
  return proxy.get({plain: true});
};

// 更新代理
Proxy.updateAsync = function* (proxy_id, data) {
  let proxy = yield ProxyModel.findById(proxy_id);
  if (!proxy) {
    return false;
  }

  // 更新数据库
  proxy = yield proxy.update(data);
  proxy = proxy.get({plain: true});

  // 删除缓存
  yield this.removeCacheByDomainAsync(proxy.domain);
  return proxy;
};

// 删除代理
Proxy.removeAsync = function* (proxy_id) {
  let proxy = yield ProxyModel.findById(proxy_id);
  if (!proxy) {
    return false;
  }

  // 删除缓存
  yield this.removeCacheByDomainAsync(proxy.domain);
  return proxy.destroy();
};
