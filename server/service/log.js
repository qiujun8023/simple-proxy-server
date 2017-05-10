'use strict';

const redis = require('../lib/redis');

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
  console.log(log)
};
