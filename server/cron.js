'use strict';

// eslint-disable-next-line
process.env.NODE_CONFIG_DIR= __dirname +'/config';
process.env.TZ = 'Asia/Shanghai';

const logs = require('./cron/logs');

logs.update.start();
logs.clean.start();
