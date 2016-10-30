'use strict';

const _ = require('lodash');

const LogModel = require('../model').Log;
const ProxyModel = require('../model').Proxy;

exports = module.exports = {};

// 增加日志
exports.addAsync = function* (options) {
  let log = yield LogModel.create(options);
  return _.isEmpty(log) ? false : log.log_id;
};

// 查询日志
exports.findAsync = function* (where, with_proxy) {
  let options = {where};
  if (with_proxy) {
    options['include'] = [ProxyModel];
  }

  let logs = yield LogModel.findAll(options);
  if (_.isEmpty(logs)) {
    return [];
  }

  let res = [];
  for (let log of logs) {
    res.push(log.get({plain: true}));
  }
  return res;
};

// 获取未设置地址的 IP 集合
exports.findIpsAsync = function* () {
  let logs = yield LogModel.aggregate('ip', 'DISTINCT', {
    where: {
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
  return res;
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
