'use strict';

process.env.NODE_CONFIG_DIR = './server/config';
process.env.TZ = 'Asia/Shanghai';

const co = require('co');
const parser = require('ua-parser-js');
const {Log, Ip} = require('./service');

co(function* () {
  while (true) { // eslint-disable-line
    let log = yield Log.popQueueAsync();
    if (!log) {
      continue;
    }

    let ua = parser(log.ua);
    let location = yield Ip.getLocationWithCacheAsync(log.ip);

    yield Log.addAsync(Object.assign(log, {
      // 位置信息
      country: location && location.country ? location.country : '',
      region: location && location.region ? location.region : '',
      city: location && location.city ? location.city : '',
      isp: location && location.isp ? location.isp : '',

      // 设备信息
      browser_name: ua.browser.name || '',
      browser_version: ua.browser.version || '',
      engine_name: ua.engine.name || '',
      engine_version: ua.engine.version || '',
      os_name: ua.os.name || '',
      os_version: ua.os.version || '',
      device_vendor: ua.device.vendor || '',
      device_model: ua.device.model || '',
      device_type: ua.device.type || '',
    }));
  }
}).catch(console.error);  // eslint-disable-line
