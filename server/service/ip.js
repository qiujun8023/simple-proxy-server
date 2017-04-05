'use strict';

const _ = require('lodash');
const request = require('co-request');
const redis = require('../lib/redis');

let Ip = module.exports = {};

// 缓存前缀
Ip._cache_prefix = 'ip:';

// 获取缓存 Key
Ip.getCacheKeyByIp = function (ip) {
  return this._cache_prefix + ip;
};

// 通过域名获取缓存
Ip.getCacheByIpAsync = function* (ip) {
  let cache_key = this.getCacheKeyByIp(ip);
  let cache = yield redis.get(cache_key);
  return cache ? JSON.parse(cache) : null;
};

// 通过域名设置缓存
Ip.setCacheByIpAsync = function* (ip, data) {
  let cache_key = this.getCacheKeyByIp(ip);
  return yield redis.set(cache_key, JSON.stringify(data), 'EX', 604800);
};

// 获取 IP 所在地
Ip.getLocationAsync = function* (ip) {
  let location;
  try {
    let url = `http://freeapi.ipip.net/${ip}`;
    let headers = {'User-Agent': 'request'};
    let result = yield request(url, {headers});
    location = JSON.parse(result.body);
  } catch (err) {
    return false;
  }

  if (!_.isArray(location)) {
    return false;
  }

  return {
    country: location[0],
    region: location[1],
    city: location[2],
    isp: location[4],
  };
};

// 通过缓存获取所在地
Ip.getLocationWithCacheAsync = function* (ip) {
  // 从缓存中读取
  let location = yield this.getCacheByIpAsync(ip);

  // 实时读取
  if (!location) {
    location = yield this.getLocationAsync(ip);
  }

  if (!location) {
    return false;
  }

  // 写入缓存
  yield this.setCacheByIpAsync(ip, location);

  return location;
};
