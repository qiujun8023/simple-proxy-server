'use strict';

const config = require('config');

describe('middleware/router', function () {
  it('should return 404 if path not exist', function* () {
    yield api
      .post('/path/to/invalid')
      .set('Host', config.domain)
      .expect(404);
  });
});
