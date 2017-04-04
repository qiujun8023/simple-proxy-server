'use strict';

const UserPlugin = require('../../lib/test/plugin/user');
const user_plugin = UserPlugin();

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

  it('should return forbidden if user is locked', function* () {
    const locked_user_plugin = UserPlugin();
    yield locked_user_plugin.before({is_locked: true});
    yield api
      .get('/api/profile')
      .use(locked_user_plugin.plugin())
      .expect(403);
    yield locked_user_plugin.after();
  });

  it('should allow if use plugin', function* () {
    yield api
      .get('/api/profile')
      .use(user_plugin.plugin())
      .expect(200);
  });

  it('should allow if url in white list', function* () {
    yield api
      .get('/api/config')
      .expect(200);
  });

  it('should allow if url end with /', function* () {
    yield api
      .get('/api/config/')
      .expect(200);
  });
});
