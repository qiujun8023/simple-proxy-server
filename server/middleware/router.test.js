'use strict';

const config = require('config');

describe('server/middleware/router', function () {
  describe('get', function () {
    it('should return 404 if path not exist', function* () {
      yield api
        .get('/api/path/to/invalid')
        .set('Host', config.domain)
        .expect(404);
    });
  });
});
