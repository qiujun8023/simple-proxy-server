'use strict';

const co = require('co');
const now = require('nano-time');
const requestStats = require('request-stats');
const {Log} = require('../service');
const logger = require('../lib/logger');

let log = function* (info) {
  // 非代理访问不记录
  if (!info.req.headers['x-proxy-id']) {
    return;
  }

  // 格式化记录信息
  let bytes = info.req.bytes + info.res.bytes;
  let options = {
    proxy_id: info.req.headers['x-proxy-id'],
    ip: info.req.headers['x-forwarded-for'],
    status: info.res.status,
    method: info.req.method,
    path: info.req.path,
    user_agent: info.req.headers['user-agent'] || '',
    bytes,
    cost: info.time,
    speed: bytes * 8 / info.time,
    timestamp: info.timestamp,
  };

  // 插入数据库
  return yield Log.pushQueueAsync(options);
};

let stat = function (req, res, next) {
  // 监听事件，记录日志
  req.timestamp = now();
  requestStats(req, res, function (info) {
    info.timestamp = req.timestamp;
    co.wrap(log)(info).catch(logger.error);
  });

  next();
};

module.exports = () => stat;
