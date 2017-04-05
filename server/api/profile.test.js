'use strict';

const {expect} = require('chai');
const user_plugin = require('../lib/test/plugin/user')();

const BASE_RUL = '/api/profile';

describe(BASE_RUL, function () {
  let user;

  before(function* () {
    user = yield user_plugin.before();
  });

  after(function* () {
    yield user_plugin.after();
  });

  describe('get', function () {
    it('should get profile success', function* () {
      let res = yield api
        .get(BASE_RUL)
        .use(user_plugin.plugin())
        .expect(200);
      expect(res.body.user_id).to.equal(user.user_id);
    });
  });
});
