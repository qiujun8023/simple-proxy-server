'use strict';

const config = require('config');
const {expect} = require('chai');
const proxyRandom = require('../../lib/test/random/proxy');
const sslRandom = require('../../lib/test/random/ssl');
const UserPlugin = require('../../lib/test/plugin/user');

const BASE_RUL = '/api/proxies';

describe(BASE_RUL, function () {
  let user;
  let user_plugin = UserPlugin();
  let admin_user_plugin = UserPlugin();
  let proxies;

  before(function* () {
    user = yield user_plugin.before();
    yield admin_user_plugin.before({is_admin: true});
  });

  after(function* () {
    yield user_plugin.after();
    yield admin_user_plugin.after();
  });

  describe('post', function () {
    let domain = proxyRandom.getDomain();

    it('should add proxy success', function* () {
      let res = yield api
        .post(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          domain,
          mark: proxyRandom.getMark(),
          target: proxyRandom.getDomain(),
          hostname: proxyRandom.getDomain(),
        })
        .expect(201);

      let keys = [
        'proxy_id',
        'user_id',
        'mark',
        'domain',
        'hostname',
        'target',
        'target_type',
        'proxy_type',
        'is_enabled',
      ];
      expect(res.body).to.include.keys(keys);
    });

    it('should return forbidden if domain not allow', function* () {
      yield api
        .post(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          domain: config.domain,
          mark: proxyRandom.getMark(),
          target: proxyRandom.getDomain(),
          hostname: proxyRandom.getDomain(),
        })
        .expect(403);
    });

    it('should add proxy failure without domain', function* () {
      yield api
        .post(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          mark: proxyRandom.getMark(),
          target: proxyRandom.getDomain(),
          hostname: proxyRandom.getDomain(),
        })
        .expect(400);
    });

    it('should add proxy failure with same domain', function* () {
      yield api
        .post(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          domain,
          mark: proxyRandom.getMark(),
          target: proxyRandom.getDomain(),
          hostname: proxyRandom.getDomain(),
        })
        .expect(400);
    });

    it('should add proxy for others success', function* () {
      yield api
        .post(BASE_RUL)
        .use(admin_user_plugin.plugin())
        .send({
          user_id: user.user_id,
          mark: proxyRandom.getMark(),
          domain: proxyRandom.getDomain(),
          target: proxyRandom.getDomain(),
          hostname: proxyRandom.getDomain(),
          ssl: {
            cert: sslRandom.getCert(),
            key: sslRandom.getKey(),
          },
        })
        .expect(201);
    });
  });

  describe('get', function () {
    it('should get proxy list success', function* () {
      let res = yield api
        .get(BASE_RUL)
        .use(user_plugin.plugin())
        .expect(200);

      expect(res.body).to.be.instanceof(Array);
      expect(res.body.length).to.equal(2);
      proxies = res.body;
    });

    it('should get others proxy list success', function* () {
      let res = yield api
        .get(BASE_RUL)
        .query({user_id: user.user_id})
        .use(admin_user_plugin.plugin())
        .expect(200);

      expect(res.body).to.be.instanceof(Array);
      expect(res.body.length).to.equal(2);
    });
  });

  describe('get /:proxy_id', function () {
    it('should get proxy success', function* () {
      let res = yield api
        .get(BASE_RUL + '/' + proxies[0].proxy_id)
        .use(user_plugin.plugin())
        .expect(200);

      expect(res.body.name).to.equal(proxies[0].name);
    });
  });

  describe('put /:proxy_id', function () {
    it('should update failture if data not found', function* () {
      let mark = proxyRandom.getMark();
      yield api
        .put(BASE_RUL + '/-1')
        .use(user_plugin.plugin())
        .send({mark})
        .expect(404);
    });

    it('should return forbidden if domain not allow', function* () {
      let domain = config.domain;
      yield api
        .put(BASE_RUL + '/' + proxies[0].proxy_id)
        .use(user_plugin.plugin())
        .send({domain})
        .expect(403);
    });

    it('should update proxy success', function* () {
      let mark = proxyRandom.getMark();
      let res = yield api
        .put(BASE_RUL + '/' + proxies[0].proxy_id)
        .use(user_plugin.plugin())
        .send({mark})
        .expect(200);
      expect(res.body.mark).to.equal(mark);
      expect(res.body.ssl.uploaded).to.be.false;
    });

    it('should update proxy success', function* () {
      let res = yield api
        .put(BASE_RUL + '/' + proxies[0].proxy_id)
        .use(user_plugin.plugin())
        .send({
          ssl: {
            cert: sslRandom.getCert(),
            key: sslRandom.getKey(),
          },
        })
        .expect(200);
      expect(res.body.ssl.uploaded).to.be.true;
    });

    it('should update failure with same domain', function* () {
      yield api
        .put(BASE_RUL + '/' + proxies[0].proxy_id)
        .use(user_plugin.plugin())
        .send({
          domain: proxies[1].domain,
        })
        .expect(400);
    });
  });

  describe('delete /:proxy_id', function () {
    it('should delete failture if data not found', function* () {
      yield api
        .delete(BASE_RUL + '/-1')
        .use(user_plugin.plugin())
        .expect(404);
    });

    it('should delete proxy success', function* () {
      for (let proxy of proxies) {
        let {proxy_id} = proxy;
        yield api
          .delete(BASE_RUL + '/' + proxy_id)
          .use(user_plugin.plugin())
          .expect(200);

        yield api
          .get(BASE_RUL + '/' + proxy_id)
          .expect(404);
      }
    });
  });
});
