'use strict';

const config = require('config');
const expect = require('chai').expect;

const random = require('../lib/test/random');

describe('server/router/action', function () {
  let user_id = random.proxy.getUserId();
  let list;

  describe('auth', function () {
    it('should return 401 if need login', function* () {
      yield api
        .get('/action')
        .set('Host', config.domain)
        .expect(401);
    });

    it('should allow if set x-user-id', function* () {
      yield api
        .get('/action')
        .set('Host', config.domain)
        .use(function (req) {
          req.set('x-user-id', user_id);
        })
        .expect(200);
    });

    it('should allow if set session', function* () {
      yield api
        .get('/action')
        .set('Host', config.domain)
        .expect(200);
    });
  });

  describe('put', function () {
    it('should return forbidden if domain not allow', function* () {
      yield api
        .put('/action')
        .set('Host', config.domain)
        .send({
          mark: random.proxy.getMark(),
          domain: config.domain,
          target: random.domain(),
          hostname: random.domain(),
        })
        .expect(403);
    });

    it('should add proxy success', function* () {
      let res = yield api
        .put('/action')
        .set('Host', config.domain)
        .send({
          mark: random.proxy.getMark(),
          domain: random.domain(),
          target: random.domain(),
          hostname: random.domain(),
        })
        .expect(201);

      expect(res.body).to.deep.equal({result: true});
    });
  });

  describe('get', function () {
    it('should get proxy success', function* () {
      let res = yield api
        .get('/action')
        .set('Host', config.domain)
        .expect(200);

      list = res.body.list;
      expect(res.body.user.user_id).to.equal(user_id);
      expect(list).to.be.instanceof(Array);
      expect(list.length).to.equal(1);
    });
  });

  describe('update', function () {
    it('should update failture if data not found', function* () {
      yield api
        .post('/action')
        .set('Host', config.domain)
        .send({
          id: -1,
          mark: random.proxy.getMark(),
        })
        .expect(404);
    });

    it('should return forbidden if domain not allow', function* () {
      yield api
        .post('/action')
        .set('Host', config.domain)
        .send({
          id: list[0].id,
          domain: config.domain,
        })
        .expect(403);
    });

    it('should update proxy success', function* () {
      let mark = random.proxy.getMark();
      yield api
        .post('/action')
        .set('Host', config.domain)
        .send({
          id: list[0].id,
          mark: mark,
        })
        .expect(200);

      let res = yield api
        .get('/action')
        .set('Host', config.domain)
        .expect(200);
      list = res.body.list;
      expect(list.length).to.equal(1);
      expect(list[0].mark).to.equal(mark);
    });
  });

  describe('delete', function () {
    it('should delete failture if data not found', function* () {
      yield api
        .delete('/action')
        .set('Host', config.domain)
        .query({
          id: -1,
        })
        .expect(404);
    });

    it('should delete proxy success', function* () {
      yield api
        .delete('/action')
        .set('Host', config.domain)
        .query({
          id: list[0].id,
        })
        .expect(200);

      let res = yield api
        .get('/action')
        .set('Host', config.domain)
        .expect(200);
      list = res.body.list;
      expect(list.length).to.equal(0);
    });
  });
});
