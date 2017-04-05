'use strict';

const {expect} = require('chai');
const UserPlugin = require('../../lib/test/plugin/user');

const BASE_RUL = '/api/users';

describe(BASE_RUL, function () {
  describe('get', function () {
    it('should get user list success', function* () {
      let user_plugin = UserPlugin();
      yield user_plugin.before({is_admin: true});

      let res = yield api
        .get(BASE_RUL)
        .use(user_plugin.plugin())
        .expect(200);
      expect(res.body).to.be.instanceof(Array);

      yield user_plugin.after();
    });

    it('should get user list failure', function* () {
      let user_plugin = UserPlugin();
      yield user_plugin.before({is_admin: false});

      yield api
        .get(BASE_RUL)
        .use(user_plugin.plugin())
        .expect(403);

      yield user_plugin.after();
    });
  });
});
