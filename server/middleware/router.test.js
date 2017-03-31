'use strict';

const user_plugin = require('../lib/test/plugin/user')();

describe('middleware/router', function () {
  before(function* () {
    yield user_plugin.before();
  });

  after(function* () {
    yield user_plugin.after();
  });

  it('should return index.html if page not found', function* () {
    yield api
      .get('/path/to/invalid')
      .expect(200);
  });

  it('should return 404 if api not found', function* () {
    yield api
      .get('/api/path/to/invalid')
      .use(user_plugin.plugin())
      .expect(404);
  });
});
