'use strict';

const utility = require('../../lib/test/utility');
const UserPlugin = require('../../lib/test/plugin/user');
const user_plugin = UserPlugin();
const admin_plugin = UserPlugin();

const BASE_RUL = '/api/logs/slow';

describe('middleware/auth/stats', function () {
  let user;
  let admin;
  let proxy;

  before(function* () {
    user = yield user_plugin.before();
    proxy = yield utility.createTestProxyAsync({user_id: user.user_id});
    admin = yield admin_plugin.before({is_admin: true});
  });

  after(function* () {
    yield utility.removeTestProxyAsync(proxy);
    yield user_plugin.after();
    yield admin_plugin.after();
  });

  it('should return slow log list success', function* () {
    yield api
      .get(BASE_RUL)
      .use(user_plugin.plugin())
      .query({
        proxy_id: proxy.proxy_id,
      })
      .expect(200);
  });

  it('should return admin slow log list success', function* () {
    yield api
      .get(BASE_RUL)
      .use(admin_plugin.plugin())
      .expect(200);
  });

  it('should return slow log by admin list success', function* () {
    yield api
      .get(BASE_RUL)
      .use(admin_plugin.plugin())
      .query({
        user_id: user.user_id,
        proxy_id: proxy.proxy_id,
      })
      .expect(200);
  });

  it('provide user_id is useful', function* () {
    yield api
      .get(BASE_RUL)
      .use(user_plugin.plugin())
      .query({
        user_id: admin.user_id,
        proxy_id: proxy.proxy_id,
      })
      .expect(200);
  });

  it('should return all proxies if proxy_id not provide', function* () {
    yield api
      .get(BASE_RUL)
      .use(admin_plugin.plugin())
      .query({
        user_id: user.user_id,
      })
      .expect(200);
  });

  it('should return not found with invalid proxy_id', function* () {
    yield api
      .get(BASE_RUL)
      .use(admin_plugin.plugin())
      .query({
        proxy_id: '-1',
      })
      .expect(404);
  });

  it('should return not found if user_id not provide', function* () {
    yield api
      .get(BASE_RUL)
      .use(admin_plugin.plugin())
      .query({
        proxy_id: proxy.proxy_id,
      })
      .expect(404);
  });
});
