'use strict';

const user_plugin = require('../../lib/test/plugin/user')();

describe('middleware/auth/is_login', function () {
  before(function* () {
    yield user_plugin.before();
  });

  after(function* () {
    yield user_plugin.after();
  });

  it('should return 401 if need login', function* () {
    yield api
      .get('/api/profile')
      .expect(401);
  });

  it('should allow if use plugin', function* () {
    yield api
      .get('/api/profile')
      .use(user_plugin.plugin())
      .expect(200);
  });
});
