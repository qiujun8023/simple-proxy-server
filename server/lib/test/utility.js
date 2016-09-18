'use strict';

const _ = require('lodash');

const random = require('./random');
const ProxyServer = require('../../service/proxy');

exports._createTestProxyAsync = function* (tls, opts) {
  let data = {};
  data.user_id = random.proxy.getUserId();
  data.mark = random.proxy.getMark();
  data.domain = random.domain();
  data.target = random.domain();
  data.target_type = random.proxy.getTargetType();
  data.hostname = random.domain();
  data.proxy_type = random.proxy.getProxyType();
  if (tls) {
    data.cert = random.proxy.getCert();
    data.key = random.proxy.getKey();
  }

  data = _.assign(data, opts || {});
  let id = yield ProxyServer.addAsync(data);
  return yield ProxyServer.getAsync(id);
};

exports.createTestProxyAsync = function* (opts) {
  return yield this._createTestProxyAsync(false, opts);
};

exports.createTestProxyWithTlsAsync = function* (opts) {
  return yield this._createTestProxyAsync(true, opts);
};

exports.removeTestProxyAsync = function* (proxy) {
  return yield ProxyServer.removeAsync(proxy.id);
};
