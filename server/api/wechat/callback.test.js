'use strict';

const BASE_RUL = '/api/wechat/callback';

describe(BASE_RUL, function () {
  describe('get', function () {
    it('should throw bad request error if auth_code not found', function* () {
      yield api
        .get(BASE_RUL)
        .expect(400);
    });

    it('should throw System error with invalid auth_code', function* () {
      yield api
        .get(BASE_RUL)
        .query({
          auth_code: 'invalid auth_code',
        })
        .expect(400);
    });
  });
});
