'use strict';

const _ = require('lodash');
const now = require('nano-time');
const userRandom = require('./random/user');
const proxyRandom = require('./random/proxy');
const logRandom = require('./random/log');
const {User, Proxy} = require('../../service');

exports.createTestUserAsync = function* (opts) {
  let data = _.assign({
    user_id: userRandom.getUserId(),
    name: userRandom.getName(),
    gender: userRandom.getGender(),
    mobile: userRandom.getMobile(),
    email: userRandom.getEmail(),
    avatar: userRandom.getAvatar(),
  }, opts || {});

  return yield User.upsertAsync(data);
};

exports.removeTestUserAsync = function* (user) {
  return yield User.removeAsync(user.user_id);
};

exports.createTestProxyAsync = function* (opts) {
  let data = _.assign({
    user_id: proxyRandom.getUserId(),
    mark: proxyRandom.getMark(),
    domain: proxyRandom.getDomain(),
    target: proxyRandom.getDomain(),
    target_type: proxyRandom.getTargetType(),
    hostname: proxyRandom.getDomain(),
    proxy_type: proxyRandom.getProxyType(),
  }, opts || {});
  return yield Proxy.addAsync(data);
};

exports.removeTestProxyAsync = function* (proxy) {
  return yield Proxy.removeAsync(proxy.proxy_id);
};

exports.generateLog = function (opts) {
  return _.assign({
    proxy_id: -1,
    ip: logRandom.getIp(),
    status: logRandom.getStatus(),
    method: logRandom.getMethod(),
    path: logRandom.getPath(),
    user_agent: logRandom.getUserAgent(),
    bytes: logRandom.getBytes(),
    cost: logRandom.getCost(),
    speed: logRandom.getSpeed(),
    timestamp: now(),
  }, opts || {});
};
