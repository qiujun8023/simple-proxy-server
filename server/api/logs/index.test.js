'use strict';

const {expect} = require('chai');
const utility = require('../../lib/test/utility');
const user_plugin = require('../../lib/test/plugin/user')();
const LogService = require('../../service/log');

const BASE_RUL = '/api/logs';

describe(BASE_RUL, function () {
  let user;
  let proxy;

  let getLogsAsync = function* (url) {
    let res = yield api
      .get(BASE_RUL + url)
      .use(user_plugin.plugin())
      .query({
        start_day: 0,
        end_day: 1,
      })
      .expect(200);
    return res.body;
  };

  before(function* () {
    this.timeout(20000);
    user = yield user_plugin.before();
    proxy = yield utility.createTestProxyAsync({user_id: user.user_id});
    let log1 = utility.generateLog({proxy_id: proxy.proxy_id, status: 502});
    let log2 = utility.generateLog({proxy_id: proxy.proxy_id, status: 404});
    yield LogService.addAsync(log1);
    yield LogService.addAsync(log2);
  });

  after(function* () {
    yield user_plugin.after();
    yield utility.removeTestProxyAsync(proxy);
  });

  it('should get slow logs success', function* () {
    let body = yield getLogsAsync('/slow');
    expect(body[0]).to.include.keys(['method', 'path', 'cost']);
  });

  it('should get error logs success', function* () {
    let body = yield getLogsAsync('/error');
    expect(body[0]).to.include.keys(['method', 'path', 'status', 'count']);
  });

  it('should get slow logs success', function* () {
    let body = yield getLogsAsync('/hot');
    expect(body[0]).to.include.keys(['method', 'path', 'count']);
  });

  it('should get slow hot ip logs success', function* () {
    let body = yield getLogsAsync('/hot_ip');
    expect(body[0]).to.include.keys(['ip', 'region', 'city', 'count']);
  });
});
