'use strict';

const _ = require('lodash');
const parser = require('ua-parser-js');
const redis = require('../lib/redis');
const influx = require('../lib/influx');
const IpService = require('./ip');

const QUEUE_KEY = 'logs';
const ENPTY_VALUE = 'UNKNOWN';

let Log = module.exports = {};

// 加入队列
Log.pushQueueAsync = function* (data) {
  let res = yield redis.rpush(QUEUE_KEY, JSON.stringify(data));
  return Boolean(res);
};

// 取出队列
Log.popQueueAsync = function* (timeout) {
  let cache = yield redis.blpop(QUEUE_KEY, timeout || 0);
  return cache ? JSON.parse(cache[1]) : null;
};

// 原始数据
Log.addRawAsync = function* (timestamp, raw) {
  return yield influx.writePoints([{
    measurement: influx.MEASUREMENTS.RAW,
    fields: _.pick(raw, ['status', 'bytes', 'cost', 'speed']),
    tags: _.pick(raw, ['proxy_id', 'ip', 'status', 'method', 'path']),
    timestamp,
  }]);
};

// 位置信息
Log.addLocationAsync = function* (timestamp, proxy_id, ip, location) {
  return yield influx.writePoints([{
    measurement: influx.MEASUREMENTS.LOCATION,
    fields: {sentinel: true},
    tags: {
      proxy_id,
      ip,
      country: location && location.country ? location.country : ENPTY_VALUE,
      region: location && location.region ? location.region : ENPTY_VALUE,
      city: location && location.city ? location.city : ENPTY_VALUE,
      isp: location && location.isp ? location.isp : ENPTY_VALUE,
    },
    timestamp,
  }]);
};

// 浏览器信息
Log.addBrowserAsync = function* (timestamp, proxy_id, browser) {
  return yield influx.writePoints([{
    measurement: influx.MEASUREMENTS.BROWSER,
    fields: {sentinel: true},
    tags: {
      proxy_id,
      name: browser.name || ENPTY_VALUE,
      version: browser.version || ENPTY_VALUE,
    },
    timestamp,
  }]);
};

// 操作系统信息
Log.addOsAsync = function* (timestamp, proxy_id, os) {
  return yield influx.writePoints([{
    measurement: influx.MEASUREMENTS.OS,
    fields: {sentinel: true},
    tags: {
      proxy_id,
      name: os.name || ENPTY_VALUE,
      version: os.version || ENPTY_VALUE,
    },
    timestamp,
  }]);
};

// 终端信息
Log.addDeviceAsync = function* (timestamp, proxy_id, device) {
  return yield influx.writePoints([{
    measurement: influx.MEASUREMENTS.DEVICE,
    fields: {sentinel: true},
    tags: {
      proxy_id,
      vendor: device.vendor || ENPTY_VALUE,
      model: device.model || ENPTY_VALUE,
      type: device.type || ENPTY_VALUE,
    },
    timestamp,
  }]);
};

// 添加日志
Log.addAsync = function* (log) {
  let {timestamp, proxy_id} = log;

  // 原始数据
  yield this.addRawAsync(timestamp, log);

  // 位置信息
  let location = yield IpService.getLocationWithCacheAsync(log.ip);
  yield this.addLocationAsync(timestamp, proxy_id, log.ip, location);

  // 设备信息
  let {browser, os, device} = parser(log.user_agent);
  yield this.addBrowserAsync(timestamp, proxy_id, browser);
  yield this.addOsAsync(timestamp, proxy_id, os);
  yield this.addDeviceAsync(timestamp, proxy_id, device);

  return true;
};

Log.getProxyExpression = function (proxy_ids) {
  if (!proxy_ids || !proxy_ids.length) {
    return '/invalid/';
  }

  let str = '';
  for (let proxy_id of proxy_ids) {
    str = str + `|^${proxy_id}$`;
  }
  return '/' + _.trim(str, '|') + '/';
};

Log.getTimeInterval = function (start_day, end_day) {
  return Math.floor((end_day - start_day) * 4.8);
};

// 流量
Log.findFlowAsync = function* (proxy_ids, start_day, end_day) {
  let time_interval = this.getTimeInterval(start_day, end_day);
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT SUM("bytes") AS "total" FROM "raw"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY TIME(${time_interval}m)`;
  return yield influx.query(sql);
};

// 请求
Log.findRequestAsync = function* (proxy_ids, start_day, end_day) {
  let time_interval = this.getTimeInterval(start_day, end_day);
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT COUNT("bytes") AS "count" FROM "raw"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY TIME(${time_interval}m)`;
  return yield influx.query(sql);
};

// 速率情况
Log.findSpeedAsync = function* (proxy_ids, start_day, end_day) {
  let time_interval = this.getTimeInterval(start_day, end_day);
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT MAX("speed") AS "value" FROM "raw"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY TIME(${time_interval}m)`;
  return yield influx.query(sql);
};

// 省份、城市、ISP占比
Log.findAreaAsync = function* (proxy_ids, start_day, end_day, type) {
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT COUNT("sentinel") AS "count" FROM "location"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY "${type}"`;
  return yield influx.query(sql);
};

// 设备占比
Log.findDeviceAsync = function* (proxy_ids, start_day, end_day) {
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT COUNT("sentinel") AS "count" FROM "device"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY "vendor", "model"`;
  return yield influx.query(sql);
};

// 操作系统占比
Log.findOsAsync = function* (proxy_ids, start_day, end_day) {
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT COUNT("sentinel") AS "count" FROM "os"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY "name", "version"`;
  return yield influx.query(sql);
};

// 状态码占比
Log.findBrowserAsync = function* (proxy_ids, start_day, end_day) {
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT COUNT("sentinel") AS "count" FROM "browser"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY "name", "version"`;
  return yield influx.query(sql);
};

// 慢请求
Log.findSlowAsync = function* (proxy_ids, start_day, end_day) {
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT MEAN("cost") AS "cost" FROM "raw"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY "method", "path"`;
  let res = yield influx.query(sql);
  res.sort((a, b) => b.cost - a.cost);
  return res.slice(0, 100);
};

// 错误请求
Log.findErrorAsync = function* (proxy_ids, start_day, end_day) {
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT COUNT("bytes") AS "count" FROM "raw"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             AND status > 400
             GROUP BY "method", "path", "status"`;
  let res = yield influx.query(sql);
  res.sort((a, b) => b.count - a.count);
  return res.slice(0, 100);
};

// 热门请求
Log.findHotAsync = function* (proxy_ids, start_day, end_day) {
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT COUNT("bytes") AS "count" FROM "raw"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
             GROUP BY "method", "path"`;
  let res = yield influx.query(sql);
  res.sort((a, b) => b.count - a.count);
  return res.slice(0, 100);
};

// 热门IP
Log.findHotIpAsync = function* (proxy_ids, start_day, end_day) {
  let expression = this.getProxyExpression(proxy_ids);
  let sql = `SELECT COUNT("sentinel") AS "count" FROM "location"
             WHERE TIME < NOW() - ${start_day}d
             AND TIME > NOW() - ${end_day}d
             AND "proxy_id" =~ ${expression}
            GROUP BY "ip", "region", "city"`;
  let res = yield influx.query(sql);
  res.sort((a, b) => b.count - a.count);
  return res.slice(0, 100);
};
