'use strict';

// eslint-disable-next-line
process.env.NODE_CONFIG_DIR= __dirname +'/config';

const logs = require('./cron/logs');

logs.data_clean.start();
logs.set_location.start();
