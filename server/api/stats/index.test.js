'use strict';

const {expect} = require('chai');
const utility = require('../../lib/test/utility');
const user_plugin = require('../../lib/test/plugin/user')();
const LogService = require('../../service/log');

const BASE_RUL = '/api/stats';

describe(BASE_RUL, function () {
  let user;
  let proxy;

  let getStatsAsync = function* (url) {
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
    this.timeout(10000);
    user = yield user_plugin.before();
    proxy = yield utility.createTestProxyAsync({user_id: user.user_id});
    let log = utility.generateLog({proxy_id: proxy.proxy_id});
    yield LogService.addAsync(log);
  });

  after(function* () {
    yield user_plugin.after();
    yield utility.removeTestProxyAsync(proxy);
  });

  it('should get flow data success', function* () {
    let body = yield getStatsAsync('/flow');
    expect(body[0]).to.include.keys(['flow', 'request', 'time']);
  });

  it('should get speed data success', function* () {
    let body = yield getStatsAsync('/speed');
    expect(body[0]).to.include.keys(['value', 'time']);
  });

  it('should get region data success', function* () {
    let body = yield getStatsAsync('/region');
    expect(body[0]).to.include.keys(['region', 'count']);
  });

  it('should get device data success', function* () {
    let body = yield getStatsAsync('/device');
    expect(body[0]).to.include.keys(['vendor', 'model', 'count']);
  });

  it('should get os data success', function* () {
    let body = yield getStatsAsync('/os');
    expect(body[0]).to.include.keys(['name', 'version', 'count']);
  });

  it('should get browser data success', function* () {
    let body = yield getStatsAsync('/browser');
    expect(body[0]).to.include.keys(['name', 'version', 'count']);
  });
});
