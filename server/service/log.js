'use strict';

const _ = require('lodash');
const LogModel = require('../model').Log;

exports = module.exports = {};

// 增加日志
exports.addAsync = function* (options) {
  let log = yield LogModel.create(options);
  return log.get({plain: true});
};

// 获取未设置地址的 IP 集合
exports.findNeedUpdateAsync = function* (limit) {
  let logs = yield LogModel.aggregate('ip', 'DISTINCT', {
    where: {
      country: null,
      region: null,
      city: null,
      isp: null,
    },
    plain: false,
  });

  let res = [];
  for (let log of logs) {
    res.push(log['DISTINCT']);
  }

  return _.sampleSize(res, limit);
};

// 通过 IP 更新
exports.updateByIpAsync = function* (ip, data) {
  return yield LogModel.update(data, {
    where: {ip},
  });
};

// 通过时间删除
exports.deleteByTimeAsync = function* (days_ago) {
  let ms = days_ago * 24 * 60 * 60 * 1000;
  return yield LogModel.destroy({
    where: {
      created_at: {
        $lt: new Date(new Date() - ms),
      },
    },
  });
};
