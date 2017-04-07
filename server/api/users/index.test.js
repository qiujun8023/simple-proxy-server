'use strict';

const {expect} = require('chai');
const random = require('../../lib/test/random/user');
const UserPlugin = require('../../lib/test/plugin/user');

const BASE_RUL = '/api/users';

describe(BASE_RUL, function () {
  let user;
  let user_plugin = UserPlugin();

  before(function* () {
    user = yield user_plugin.before({is_admin: true});
  });

  after(function* () {
    yield user_plugin.after();
  });

  describe('auth', function () {
    it('should get user list failure', function* () {
      let tmp_user_plugin = UserPlugin();
      yield tmp_user_plugin.before({is_admin: false});

      yield api
        .get(BASE_RUL)
        .use(tmp_user_plugin.plugin())
        .expect(403);

      yield tmp_user_plugin.after();
    });
  });

  describe('get', function () {
    it('should get user list success', function* () {
      let res = yield api
        .get(BASE_RUL)
        .use(user_plugin.plugin())
        .expect(200);
      expect(res.body).to.be.instanceof(Array);
    });
  });

  describe('get :user_id', function () {
    it('should get user success', function* () {
      let res = yield api
        .get(BASE_RUL + '/' + user.user_id)
        .use(user_plugin.plugin())
        .expect(200);
      expect(res.body.name).to.equal(user.name);
    });
  });

  describe('put :user_id', function () {
    it('should update user success', function* () {
      let name = random.getName();
      let res = yield api
        .put(BASE_RUL + '/' + user.user_id)
        .send({name})
        .use(user_plugin.plugin())
        .expect(200);
      user = res.body;
      expect(user.name).to.equal(name);
    });
  });
});
