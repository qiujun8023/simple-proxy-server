'use strict';

const config = require('config');

describe('server/router/wechat', function () {
  describe('oauth', function () {
    it('should return javascript redirect', function* () {
      yield api
        .get('/wechat/oauth')
        .set('Host', config.domain)
        .expect(200);
    });
  });

  describe('callback', function () {
    it('should throw bad request error if auth_code not found', function* () {
      yield api
        .get('/wechat/callback')
        .set('Host', config.domain)
        .expect(400);
    });

    it('should throw System error with invalid auth_code', function* () {
      yield api
        .get('/wechat/callback')
        .set('Host', config.domain)
        .query({
          auth_code: 'invalid auth_code',
        })
        .expect(400);
    });
  });

  describe('logout', function () {
    it('should logout success', function* () {
      yield api
        .get('/wechat/logout')
        .set('Host', config.domain)
        .expect(302);

      yield api
        .get('/action')
        .set('Host', config.domain)
        .expect(401);
    });
  });
});
