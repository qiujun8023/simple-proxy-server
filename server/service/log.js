'use strict';

const _ = require('lodash');

const LogModel = require('../model').Log;

exports = module.exports = {};

// 增加日志
exports.addAsync = function* (options) {
  let log = yield LogModel.create(options);
  return _.isEmpty(log) ? false : log.log_id;
};
