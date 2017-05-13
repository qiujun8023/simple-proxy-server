'use strict';

const {expect} = require('chai');
const utility = require('../../lib/test/utility');
const user_plugin = require('../../lib/test/plugin/user')();
const LogService = require('../../service/log');

const BASE_RUL = '/api/stats';

describe(BASE_RUL, function () {
  let user;
  let proxy;

  before(function* () {
    user = yield user_plugin.before();
    proxy = yield utility.createTestProxyAsync({user_id: user.user_id});
    let log = utility.generateLog({proxy_id: proxy.proxy_id});
    yield LogService.addAsync(log);
  });

  after(function* () {
    yield user_plugin.after();
    yield utility.removeTestProxyAsync(proxy);
  });

  describe('get flow', function () {
    it('should get flow data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/flow')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['flow', 'request', 'time']);
    });
  });

  describe('get speed', function () {
    it('should get speed data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/speed')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['value', 'time']);
    });
  });

  describe('get region', function () {
    it('should get region data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/region')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['region', 'count']);
    });
  });

  describe('get device', function () {
    it('should get device data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/device')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['vendor', 'model', 'count']);
    });
  });

  describe('get os', function () {
    it('should get os data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/os')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['name', 'version', 'count']);
    });
  });

  describe('get status', function () {
    it('should get status data success', function* () {
      let res = yield api
        .get(BASE_RUL + '/status')
        .use(user_plugin.plugin())
        .query({
          start_day: 0,
          end_day: 1,
        })
        .expect(200);
      expect(res.body[0]).to.include.keys(['status', 'count']);
    });
  });
});
