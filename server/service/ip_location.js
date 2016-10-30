'use strict';

const request = require('co-request');

const redis = require('../lib/redis')('proxy');

exports = module.exports = {};

// 获取 IP 所在地
exports.getByHttpAsync = function* (ip) {
  let body;
  let options = {
    url: 'http://ip.taobao.com/service/getIpInfo.php',
    qs: {ip},
  };

  try {
    let result = yield request(options);
    body = JSON.parse(result.body);
  } catch (err) {
    return false;
  }

  return body;
};

// 缓存获取
exports.getAsync = function* (ip) {
  // 从缓存中提取数据
  let cache_key = 'ip:' + ip;
  let cache_data = JSON.parse(yield redis.get(cache_key));
  if (cache_data) {
    return cache_data;
  }

  // 请求实时数据
  let body = yield this.getByHttpAsync(ip);
  if (!body) {
    return false;
  }

  // 缓存数据
  let data = (body.code === 0) ? body.data : false;
  yield redis.set(cache_key, JSON.stringify(data), 'EX', 604800);

  return data;
};
