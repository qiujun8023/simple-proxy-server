'use strict';

const fs = require('fs');
const tls = require('tls');
const config = require('config');
const redis = require('../lib/redis');
const SslModel = require('../model').Ssl;
const ProxyModel = require('../model').Proxy;

let Ssl = module.exports = {};

Ssl._cache_prefix = 'ssl:';
if (config.https.enable) {
  Ssl._https = {
    key: fs.readFileSync(config.https.key),
    cert: fs.readFileSync(config.https.cert),
  };
}

Ssl.SNIAsync = function* (domain) {
  if (domain === config.domain) {
    return tls.createSecureContext(this._https);
  }

  let {key, cert} = yield this.getWithCacheByDomainAsync(domain);
  return tls.createSecureContext({key, cert});
};

// 获取缓存 Key
Ssl.getCacheKeyByDomain = function (domain) {
  return this._cache_prefix + domain;
};

// 通过域名获取缓存
Ssl.getCacheByDomainAsync = function* (domain) {
  let cache_key = this.getCacheKeyByDomain(domain);
  let cache = yield redis.get(cache_key);
  return cache ? JSON.parse(cache) : null;
};

// 通过域名设置缓存
Ssl.setCacheByDomainAsync = function* (domain, data) {
  let cache_key = this.getCacheKeyByDomain(domain);
  return yield redis.set(cache_key, JSON.stringify(data), 'EX', 300);
};

// 通过域名删除缓存
Ssl.removeCacheByDomainAsync = function* (domain) {
  let cache_key = this.getCacheKeyByDomain(domain);
  return yield redis.del(cache_key);
};

// 通过 proxy_id 删除缓存
Ssl.removeCacheByProxyIdAsync = function* (proxy_id) {
  let proxy = yield ProxyModel.findById(proxy_id);
  if (proxy && proxy.domain) {
    return yield this.removeCacheByDomainAsync(proxy.domain);
  }
  return false;
};

// 通过 ssl_id 获取证书信息
Ssl.getAsync = function* (ssl_id) {
  let ssl = yield SslModel.findById(ssl_id);
  if (!ssl) {
    return false;
  }

  return ssl.get({plain: true});
};

// 通过 proxy_id 获取证书信息
Ssl.getByProxyIdAsync = function* (proxy_id) {
  let ssl = yield SslModel.findOne({
    where: {proxy_id},
  });

  if (!ssl) {
    return false;
  }

  return ssl.get({plain: true});
};

// 通过 domain 获取证书信息
Ssl.getByDomainAsync = function* (domain) {
  let proxy = yield ProxyModel.findOne({
    where: {domain},
    include: [SslModel],
  });

  if (!proxy || !proxy.ssl) {
    return false;
  }

  proxy = proxy.get({plain: true});
  return proxy.ssl;
};

// 通过 domain 获取证书信息（读取缓存）
Ssl.getWithCacheByDomainAsync = function* (domain) {
  // 从缓存中读取
  let ssl = yield this.getCacheByDomainAsync(domain);

  // 从数据中查询
  if (!ssl) {
    ssl = yield this.getByDomainAsync(domain);
  }

  if (!ssl) {
    return false;
  }

  // 写入缓存
  yield this.setCacheByDomainAsync(domain, ssl);

  return ssl;
};

// 增加或修改证书信息
Ssl.upsertAsync = function* (options) {
  yield SslModel.upsert(options);
  yield this.removeCacheByProxyIdAsync(options.proxy_id);
  return yield this.getByProxyIdAsync(options.proxy_id);
};

// 删除证书信息
Ssl.removeAsync = function* (ssl_id, transaction) {
  let ssl = yield SslModel.findById(ssl_id);
  if (!ssl) {
    return false;
  }

  yield this.removeCacheByProxyIdAsync(ssl.proxy_id);
  return yield ssl.destroy({transaction});
};
