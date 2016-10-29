'use strict';

const _ = require('lodash');
const config = require('config');
const expect = require('chai').expect;

const utility = require('../lib/test/utility');
const random = require('../lib/test/random');

const ProxyService = require('./proxy');

describe('server/service/proxy', function () {
  let proxy_without_tls;
  let proxy_with_tls;

  describe('addAsync', function () {
    it('should add proxy success', function* () {
      proxy_without_tls = yield utility.createTestProxyAsync();
      expect(proxy_without_tls).to.include.keys([
        'id',
        'user_id',
        'mark',
        'domain',
        'target',
        'target_type',
        'proxy_type',
      ]);
    });

    it('should add proxy with tls success', function* () {
      proxy_with_tls = yield utility.createTestProxyWithTlsAsync();
      expect(proxy_without_tls).to.include.keys([
        'id',
        'user_id',
        'mark',
        'domain',
        'target',
        'target_type',
        'proxy_type',
        'cert',
        'key',
      ]);
    });
  });

  describe('SNIAsync', function () {
    it('should return error when key and cert not found', function* () {
      try {
        yield ProxyService.SNIAsync(proxy_with_tls.domain);
      } catch (e) {
        return;
      }
      throw new Error('should throw SNIA error but not');
    });

    it('should return ctx when key and cert exist', function* () {
      yield ProxyService.SNIAsync(config.domain);
    });
  });

  describe('getByDomainAsync', function () {
    it('should get data from mysql', function* () {
      let proxy = yield ProxyService.getByDomainAsync(proxy_with_tls.domain, true);
      let tmp_proxy = _.assign(proxy_with_tls, {is_cache: false});
      expect(proxy).to.deep.equal(tmp_proxy);
    });

    it('should get data from cache', function* () {
      let proxy = yield ProxyService.getByDomainAsync(proxy_with_tls.domain);
      expect(proxy.is_cache).to.be.true;
      expect(proxy.id).to.equal(proxy_with_tls.id);
    });

    it('should return false where domain not found', function* () {
      let domain = random.domain();
      let proxy = yield ProxyService.getByDomainAsync(domain);
      expect(proxy).to.be.false;
    });
  });

  describe('findAsync', function () {
    it('should find by user_id success', function* () {
      let list = yield ProxyService.findAsync({user_id: proxy_with_tls.user_id});
      expect(list[0].id).to.deep.equal(proxy_with_tls.id);
    });

    it('should return [] if user_id not found', function* () {
      let user_id = random.proxy.getUserId();
      let list = yield ProxyService.findAsync({user_id});
      expect(list).to.deep.equal([]);
    });
  });

  describe('updateAsync', function () {
    it('should update mark success', function* () {
      let mark = random.proxy.getMark();
      proxy_with_tls = yield ProxyService.updateAsync(proxy_with_tls.id, {mark});
      expect(proxy_with_tls.mark).to.equal(mark);
    });

    it('should update cert success', function* () {
      let cert = random.proxy.getCert();
      proxy_without_tls = yield ProxyService.updateAsync(proxy_without_tls.id, {cert});
      expect(proxy_without_tls.cert).to.equal(cert);
    });

    it('should return false where proxy not found', function* () {
      let proxy = yield ProxyService.updateAsync(-1, {});
      expect(proxy).to.be.false;
    });
  });

  describe('removeAsync', function () {
    it('should remove proxy success', function* () {
      yield utility.removeTestProxyAsync(proxy_without_tls);
      let res = yield ProxyService.getAsync(proxy_without_tls.id);
      expect(res).to.be.false;
    });

    it('should remove proxy with tls success', function* () {
      yield utility.removeTestProxyAsync(proxy_with_tls);
      let res = yield ProxyService.getAsync(proxy_with_tls.id);
      expect(res).to.be.false;
    });

    it('should return true where proxy not found', function* () {
      let proxy = yield ProxyService.removeAsync(-1);
      expect(proxy).to.be.true;
    });
  });
});
