'use strict';

const BASE_RUL = '/api/wechat/logout';

describe(BASE_RUL, function () {
  describe('post', function () {
    it('should logout success', function* () {
      yield api
        .post(BASE_RUL)
        .expect(401);
    });
  });
});
