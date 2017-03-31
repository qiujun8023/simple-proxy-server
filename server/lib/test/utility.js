'use strict';

const _ = require('lodash');
const userRandom = require('./random/user');
const proxyRandom = require('./random/proxy');
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

exports._createTestProxyAsync = function* (tls, opts) {
  let data = {};
  data.user_id = proxyRandom.getUserId();
  data.mark = proxyRandom.getMark();
  data.domain = proxyRandom.getDomain();
  data.target = proxyRandom.getDomain();
  data.target_type = proxyRandom.getTargetType();
  data.hostname = proxyRandom.getDomain();
  data.proxy_type = proxyRandom.getProxyType();
  if (tls) {
    data.cert = proxyRandom.getCert();
    data.key = proxyRandom.getKey();
  }

  data = _.assign(data, opts || {});
  let proxy_id = yield Proxy.addAsync(data);
  return yield Proxy.getAsync(proxy_id);
};

exports.createTestProxyAsync = function* (opts) {
  return yield this._createTestProxyAsync(false, opts);
};

exports.createTestProxyWithTlsAsync = function* (opts) {
  return yield this._createTestProxyAsync(true, opts);
};

exports.removeTestProxyAsync = function* (proxy) {
  return yield Proxy.removeAsync(proxy.proxy_id);
};
