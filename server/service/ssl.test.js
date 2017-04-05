'use strict';

const {expect} = require('chai');
const config = require('config');
const utility = require('../lib/test/utility');
const proxyRandom = require('../lib/test/random/proxy');
const sslRandom = require('../lib/test/random/ssl');
const SslService = require('./ssl');

describe('service/ssl', function () {
  let ssl;
  let proxy;

  before(function* () {
    proxy = yield utility.createTestProxyAsync();
  });

  after(function* () {
    yield utility.removeTestProxyAsync(proxy);
  });

  describe('SNIAsync', function () {
    it('should return ctx success when key and cert has set', function* () {
      let proxy_id = proxy.proxy_id;
      let {key, cert} = SslService._https;
      ssl = yield SslService.upsertAsync({proxy_id, key, cert});
      yield SslService.SNIAsync(proxy.domain);
    });

    it('should return ctx success when key and cert exist', function* () {
      yield SslService.SNIAsync(config.domain);
    });

  });

  describe('getCacheKeyByDomain', function () {
    it('should return cache key success', function () {
      let domain = proxyRandom.getDomain();
      let cache_key = SslService.getCacheKeyByDomain(domain);
      expect(cache_key).to.equal(SslService._cache_prefix + domain);
    });
  });

  describe('DomainCache', function () {
    let cache_data = {a: 1, b: 2, c: 3};

    it('should set cache success', function* () {
      yield SslService.setCacheByDomainAsync(proxy.domain, cache_data);
    });

    it('should get cache success', function* () {
      let res = yield SslService.getCacheByDomainAsync(proxy.domain);
      expect(res).to.deep.equal(cache_data);
    });

    it('should remove cache success', function* () {
      yield SslService.removeCacheByDomainAsync(proxy.domain);
      let res = yield SslService.getCacheByDomainAsync(proxy.domain);
      expect(res).to.equal(null);
    });

    it('should remove false if proxy id not found', function* () {
      let res = yield SslService.removeCacheByProxyIdAsync(-1);
      expect(res).to.equal(false);
    });

    it('should remove cache by proxy id success', function* () {
      yield SslService.setCacheByDomainAsync(proxy.domain, cache_data);
      yield SslService.removeCacheByProxyIdAsync(proxy.proxy_id);
      let res = yield SslService.getCacheByDomainAsync(proxy.domain);
      expect(res).to.equal(null);
    });
  });

  describe('getAsync', function () {
    it('should get ssl success', function* () {
      let tmp_ssl = yield SslService.getAsync(ssl.ssl_id);
      expect(tmp_ssl.cert).to.equal(ssl.cert);
      expect(tmp_ssl.key).to.equal(ssl.key);
    });

    it('should return false if ssl not found', function* () {
      let res = yield SslService.getAsync(-1);
      expect(res).to.be.false;
    });
  });

  describe('getByProxyIdAsync', function () {
    it('should get ssl success', function* () {
      let tmp_ssl = yield SslService.getByProxyIdAsync(proxy.proxy_id);
      expect(tmp_ssl.cert).to.equal(ssl.cert);
      expect(tmp_ssl.key).to.equal(ssl.key);
    });

    it('should return false if ssl not found', function* () {
      let res = yield SslService.getByProxyIdAsync(-1);
      expect(res).to.be.false;
    });
  });

  describe('getByDomainAsync', function () {
    it('should get ssl success', function* () {
      let tmp_ssl = yield SslService.getByDomainAsync(proxy.domain);
      expect(tmp_ssl.cert).to.equal(ssl.cert);
      expect(tmp_ssl.key).to.equal(ssl.key);
    });

    it('should return false if ssl not found', function* () {
      let domain = proxyRandom.getDomain();
      let res = yield SslService.getByDomainAsync(domain);
      expect(res).to.be.false;
    });
  });

  describe('getWithCacheByDomainAsync', function () {
    it('should return false if ssl not found', function* () {
      let domain = proxyRandom.getDomain();
      let res = yield SslService.getWithCacheByDomainAsync(domain);
      expect(res).to.be.false;
    });

    it('should get ssl success', function* () {
      let tmp_ssl = yield SslService.getWithCacheByDomainAsync(proxy.domain);
      expect(tmp_ssl.cert).to.equal(ssl.cert);
      expect(tmp_ssl.key).to.equal(ssl.key);
    });

    it('should get ssl from cache success', function* () {
      let tmp_ssl = yield SslService.getCacheByDomainAsync(proxy.domain);
      expect(tmp_ssl.cert).to.equal(ssl.cert);
      expect(tmp_ssl.key).to.equal(ssl.key);
    });
  });

  describe('upsertAsync', function () {
    it('should update ssl success', function* () {
      let key = sslRandom.getKey();
      let cert = sslRandom.getCert();
      let proxy_id = proxy.proxy_id;
      ssl = yield SslService.upsertAsync({proxy_id, cert, key});
      expect(ssl.key).to.equal(key);
      expect(ssl.cert).to.equal(cert);
      expect(ssl.proxy_id).to.equal(proxy_id);

      let res = yield SslService.getCacheByDomainAsync(proxy.domain);
      expect(res).to.be.null;
    });
  });

  describe('removeAsync', function () {
    it('should remove proxy success', function* () {
      yield SslService.removeAsync(ssl.ssl_id);
      let res = yield SslService.getAsync(ssl.ssl_id);
      expect(res).to.be.false;
    });

    it('should return false if ssl not found', function* () {
      let res = yield SslService.removeAsync(ssl.ssl_id);
      expect(res).to.be.false;
    });
  });
});
