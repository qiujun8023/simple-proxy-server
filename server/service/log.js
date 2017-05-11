'use strict';

const parser = require('ua-parser-js');
const redis = require('../lib/redis');
const influx = require('../lib/influx');
const IpService = require('./ip');

const QUEUE_KEY = 'logs';

let Log = module.exports = {};

Log.pushQueueAsync = function* (data) {
  return yield redis.rpush(QUEUE_KEY, JSON.stringify(data));
};

Log.popQueueAsync = function* (timeout) {
  let cache = yield redis.blpop(QUEUE_KEY, timeout || 0);
  return cache ? JSON.parse(cache[1]) : null;
};

Log.addAsync = function* (log) {
  let {timestamp, proxy_id} = log;

  // 分析 UserAgent 并获取 IP 所在地
  let user_agent = parser(log.user_agent);
  let location = yield IpService.getLocationWithCacheAsync(log.ip);

  let fields = {
    // 位置信息
    ip: log.ip,
    country: location && location.country ? location.country : '',
    region: location && location.region ? location.region : '',
    city: location && location.city ? location.city : '',
    isp: location && location.isp ? location.isp : '',

    // 请求信息
    is_complete: log.is_complete,
    status: log.status,
    method: log.method,
    path: log.path,

    // 设备信息
    browser_name: user_agent.browser.name || '',
    browser_version: user_agent.browser.version || '',
    engine_name: user_agent.engine.name || '',
    engine_version: user_agent.engine.version || '',
    os_name: user_agent.os.name || '',
    os_version: user_agent.os.version || '',
    device_vendor: user_agent.device.vendor || '',
    device_model: user_agent.device.model || '',
    device_type: user_agent.device.type || '',

    // 速度信息
    bytes: log.bytes,
    time: log.time,
    speed: log.speed,
  };

  return yield influx.writePoints([{
    measurement: 'logs',
    tags: {proxy_id},
    fields,
    timestamp,
  }]);
};
