'use strict';

const {expect} = require('chai');
const utility = require('../../lib/test/utility');
const user_plugin = require('../../lib/test/plugin/user')();
const LogService = require('../../service/log');

const BASE_RUL = '/api/logs';

describe(BASE_RUL, function () {
  let user;
  let proxy;

  before(function* () {
    this.timeout(10000);
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

  describe('get slow', function () {
    it('should get slow data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/slow')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['method', 'path', 'cost']);
    });
  });

  describe('get error', function () {
    it('should get error data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/error')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['method', 'path', 'status', 'count']);
    });
  });

  describe('get hot', function () {
    it('should get hot data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/hot')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['method', 'path', 'count']);
    });
  });

  describe('get hot_ip', function () {
    it('should get hot_ip data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/hot_ip')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['ip', 'count']);
    });
  });
});
