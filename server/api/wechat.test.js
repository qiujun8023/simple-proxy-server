'use strict';

const config = require('config');

describe('server/api/wechat', function () {
  describe('get /api/wechat/callback', function () {
    it('should throw bad request error if auth_code not found', function* () {
      yield api
        .get('/api/wechat/callback')
        .set('Host', config.domain)
        .expect(400);
    });

    it('should throw System error with invalid auth_code', function* () {
      yield api
        .get('/api/wechat/callback')
        .set('Host', config.domain)
        .query({
          auth_code: 'invalid auth_code',
        })
        .expect(400);
    });
  });

  describe('post /api/wechat/logout', function () {
    it('should logout success', function* () {
      yield api
        .post('/api/wechat/logout')
        .set('Host', config.domain)
        .expect(401);
    });
  });
});
