'use strict';

process.env.NODE_CONFIG_DIR = './server/config';
process.env.TZ = 'Asia/Shanghai';

const logs = require('./cron/logs');

logs.update.start();
logs.clean.start();
