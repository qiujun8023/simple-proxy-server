'use strict';

process.env.NODE_CONFIG_DIR = './server/config';
process.env.TZ = 'Asia/Shanghai';

const co = require('co');
const logger = require('./lib/logger');
const {Log} = require('./service');

co(function* () {
  while (true) { // eslint-disable-line
    let log = yield Log.popQueueAsync();
    if (!log) {
      continue;
    }

    try {
      yield Log.addAsync(log);
    } catch (err) {
      logger.error(err);
    }
  }
}).catch(logger.error);
