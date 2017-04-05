'use strict';

const config = require('config');
const cron = require('../lib/cron');
const {Log, Ip} = require('../service');
const {sleep} = require('../lib/utils');

let logs = module.exports = {};

let update_errors = {};

let isSkipUpdate = function (now, ip) {
  if (!update_errors[ip]) {
    return false;
  } else if (update_errors[ip].next_time >= now) {
    return false;
  }
  return true;
};

let updateErrorIncrease = function (now, ip) {
  if (!update_errors[ip]) {
    update_errors[ip] = {
      next_time: now,
      error_count: 1,
    };
  }
  update_errors[ip].error_count = update_errors[ip].error_count * 2;
  update_errors[ip].next_time = now + (update_errors[ip].error_count * 1000);
};

let updateErrorDecrease = function (now, ip) {
  delete update_errors[ip];
};

// 更新数据库中的地理位置信息
logs.update = cron(config.logs.cron.update, function* () {
  let now = new Date().getTime();
  let ips = yield Log.findNeedUpdateAsync(30);
  for (let ip of ips) {
    // 防止错误 IP 占用过多资源
    if (isSkipUpdate(now, ip)) {
      continue;
    }

    let location = yield Ip.getLocationWithCacheAsync(ip);
    if (location) {
      yield Log.updateByIpAsync(ip, location);
      updateErrorDecrease(now, ip);
    } else {
      updateErrorIncrease(now, ip);
    }
    yield sleep(1000);
  }
});

// 清理过期日志
logs.clean = cron(config.logs.cron.clean, function* () {
  yield Log.deleteByTimeAsync(config.logs.save_days);
});
