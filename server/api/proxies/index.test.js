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

      expect(res.body).to.deep.equal({result: true});
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
      yield api
        .put(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          proxy_id: -1,
          mark: random.getMark(),
        })
        .expect(404);
    });

    it('should return forbidden if domain not allow', function* () {
      yield api
        .put(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          proxy_id: proxy.proxy_id,
          domain: config.domain,
        })
        .expect(403);
    });

    it('should update proxy success', function* () {
      let mark = random.getMark();
      yield api
        .put(BASE_RUL)
        .use(user_plugin.plugin())
        .send({
          proxy_id: proxy.proxy_id,
          mark: mark,
        })
        .expect(200);

      let res = yield api
        .get(BASE_RUL)
        .expect(200);
      expect(res.body.length).to.equal(1);

      proxy = res.body[0];
      expect(proxy.mark).to.equal(mark);
    });
  });

  describe('delete', function () {
    it('should delete failture if data not found', function* () {
      yield api
        .delete(BASE_RUL)
        .use(user_plugin.plugin())
        .query({
          proxy_id: -1,
        })
        .expect(404);
    });

    it('should delete proxy success', function* () {
      yield api
        .delete(BASE_RUL)
        .use(user_plugin.plugin())
        .query({
          proxy_id: proxy.proxy_id,
        })
        .expect(200);

      let res = yield api
        .get(BASE_RUL)
        .expect(200);
      expect(res.body.length).to.equal(0);
    });
  });
});
