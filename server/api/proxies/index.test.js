'use strict';

const config = require('config');
const {expect} = require('chai');
const random = require('../../lib/test/random/proxy');
const user_plugin = require('../../lib/test/plugin/user')();

const BASE_RUL = '/api/proxies';

describe(BASE_RUL, function () {
  let proxy;

  before(function* () {
    yield user_plugin.before();
  });

  after(function* () {
    yield user_plugin.after();
  });

  describe('post', function () {
    it('should return forbidden if domain not allow', function* () {
      yield api
        .post(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          mark: random.getMark(),
          domain: config.domain,
          target: random.getDomain(),
          hostname: random.getDomain(),
        })
        .expect(403);
    });

    it('should add proxy success', function* () {
      let res = yield api
        .post(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          mark: random.getMark(),
          domain: random.getDomain(),
          target: random.getDomain(),
          hostname: random.getDomain(),
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
  });

  describe('get', function () {
    it('should get proxy success', function* () {
      let res = yield api
        .get(BASE_RUL)
        .use(user_plugin.plugin())
        .expect(200);

      expect(res.body).to.be.instanceof(Array);
      expect(res.body.length).to.equal(1);
      proxy = res.body[0];
    });
  });

  describe('put', function () {
    it('should update failture if data not found', function* () {
      let mark = random.getMark();
      yield api
        .put(BASE_RUL + '/-1')
        .use(user_plugin.plugin())
        .send({mark})
        .expect(404);
    });

    it('should return forbidden if domain not allow', function* () {
      let domain = config.domain;
      yield api
        .put(BASE_RUL + '/' + proxy.proxy_id)
        .use(user_plugin.plugin())
        .send({domain})
        .expect(403);
    });

    it('should update proxy success', function* () {
      let mark = random.getMark();
      let res = yield api
        .put(BASE_RUL + '/' + proxy.proxy_id)
        .use(user_plugin.plugin())
        .send({mark})
        .expect(200);
      expect(res.body.mark).to.equal(mark);
    });
  });

  describe('delete', function () {
    it('should delete failture if data not found', function* () {
      yield api
        .delete(BASE_RUL + '/-1')
        .use(user_plugin.plugin())
        .expect(404);
    });

    it('should delete proxy success', function* () {
      let {proxy_id} = proxy;
      yield api
        .delete(BASE_RUL + '/' + proxy_id)
        .use(user_plugin.plugin())
        .expect(200);

      yield api
        .get(BASE_RUL + '/' + proxy_id)
        .expect(404);
    });
  });
});
