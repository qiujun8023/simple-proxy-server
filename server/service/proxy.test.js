'use strict';

const {expect} = require('chai');
const utility = require('../lib/test/utility');
const proxyRandom = require('../lib/test/random/proxy');
const sslRandom = require('../lib/test/random/ssl');
const ProxyService = require('./proxy');
const SslService = require('./ssl');

describe('service/proxy', function () {
  let user;
  let proxy;

  before(function* () {
    user = yield utility.createTestUserAsync();
  });

  after(function* () {
    yield utility.removeTestUserAsync(proxy);
  });

  describe('getCacheKeyByDomain', function () {
    it('should return cache key success', function () {
      let domain = proxyRandom.getDomain();
      let cache_key = ProxyService.getCacheKeyByDomain(domain);
      expect(cache_key).to.equal(ProxyService._cache_prefix + domain);
    });
  });

  describe('DomainCache', function () {
    let domain = proxyRandom.getDomain();
    let cache_data = {domain};

    it('should set cache success', function* () {
      yield ProxyService.setCacheByDomainAsync(domain, cache_data);
    });

    it('should get cache success', function* () {
      let res = yield ProxyService.getCacheByDomainAsync(domain);
      expect(res).to.deep.equal(cache_data);
    });

    it('should remove cache success', function* () {
      yield ProxyService.removeCacheByDomainAsync(domain);
      let res = yield ProxyService.getCacheByDomainAsync(domain);
      expect(res).to.equal(null);
    });
  });

  describe('addAsync', function () {
    it('should add proxy success', function* () {
      proxy = yield utility.createTestProxyAsync({user_id: user.user_id});
      let keys = ['proxy_id', 'user_id', 'mark', 'domain', 'target', 'target_type', 'proxy_type'];
      expect(proxy).to.include.keys(keys);
    });
  });

  describe('getAsync', function () {
    it('should get proxy success', function* () {
      let tmp_proxy = proxy;
      proxy = yield ProxyService.getAsync(proxy.proxy_id);
      expect(tmp_proxy.proxy_id).to.equal(proxy.proxy_id);
      expect(tmp_proxy.domain).to.equal(proxy.domain);
    });
  });

  describe('getByDomainAsync', function () {
    it('should get proxy by domain success', function* () {
      let tmp_proxy = yield ProxyService.getByDomainAsync(proxy.domain);
      expect(proxy).to.deep.equal(tmp_proxy);
    });

    it('should return false if proxy is not enabled', function* () {
      let tmp_user = yield utility.createTestUserAsync();
      let tmp_proxy = yield utility.createTestProxyAsync({
        user_id: tmp_user.user_id,
        is_enabled: false,
      });

      let res1 = yield ProxyService.getByDomainAsync(tmp_proxy.domain);
      let res2 = yield ProxyService.getByDomainAsync(tmp_proxy.domain, true);
      expect(res1).to.equal(false);
      expect(res2).to.not.equal(false);

      yield utility.removeTestProxyAsync(tmp_proxy);
      yield utility.removeTestUserAsync(tmp_user);
    });

    it('should return false if user is locked', function* () {
      let tmp_user = yield utility.createTestUserAsync({is_locked: true});
      let tmp_proxy = yield utility.createTestProxyAsync({user_id: tmp_user.user_id});

      let res1 = yield ProxyService.getByDomainAsync(tmp_proxy.domain);
      let res2 = yield ProxyService.getByDomainAsync(tmp_proxy.domain, true);
      expect(res1).to.equal(false);
      expect(res2).to.not.equal(false);

      yield utility.removeTestProxyAsync(tmp_proxy);
      yield utility.removeTestUserAsync(tmp_user);
    });
  });

  describe('getWithCacheByDomainAsync', function () {
    it('should get proxy by domain success', function* () {
      let tmp_proxy = yield ProxyService.getWithCacheByDomainAsync(proxy.domain);
      expect(proxy).to.deep.equal(tmp_proxy);
    });

    it('should get proxy by domain from cache success', function* () {
      let tmp_proxy = yield ProxyService.getCacheByDomainAsync(proxy.domain);
      expect(tmp_proxy.proxy_id).to.deep.equal(proxy.proxy_id);
    });

    it('should return false if proxy not found', function* () {
      let res = yield ProxyService.getWithCacheByDomainAsync(-1);
      expect(res).to.be.false;
    });
  });

  describe('findAsync', function () {
    it('should find by user_id success', function* () {
      let list = yield ProxyService.findAsync({user_id: proxy.user_id});
      expect(list[0].proxy_id).to.deep.equal(proxy.proxy_id);
    });

    it('should return [] if user_id not found', function* () {
      let user_id = proxyRandom.getUserId();
      let list = yield ProxyService.findAsync({user_id});
      expect(list).to.deep.equal([]);
    });
  });

  describe('updateAsync', function () {
    it('should get proxy by domain from cache success', function* () {
      let tmp_proxy = yield ProxyService.getCacheByDomainAsync(proxy.domain);
      expect(tmp_proxy.proxy_id).to.deep.equal(proxy.proxy_id);
    });

    it('should update mark success', function* () {
      let mark = proxyRandom.getMark();
      proxy = yield ProxyService.updateAsync(proxy.proxy_id, {mark});
      expect(proxy.mark).to.equal(mark);
    });

    it('should get proxy by domain from cache failure', function* () {
      let res = yield ProxyService.getCacheByDomainAsync(proxy.domain);
      expect(res).to.be.null;
    });

    it('should return false where proxy not found', function* () {
      let tmp_proxy = yield ProxyService.updateAsync(-1, {});
      expect(tmp_proxy).to.be.false;
    });
  });

  describe('removeAsync', function () {
    it('should remove proxy and ssl success', function* () {
      let key = sslRandom.getKey();
      let cert = sslRandom.getCert();
      let proxy_id = proxy.proxy_id;
      let ssl = yield SslService.upsertAsync({proxy_id, cert, key});
      yield utility.removeTestProxyAsync(proxy);
      let res1 = yield ProxyService.getAsync(proxy.proxy_id);
      let res2 = yield SslService.getAsync(ssl.ssl_id);
      expect(res1).to.be.false;
      expect(res2).to.be.false;
    });

    it('should return false if proxy not found', function* () {
      let res = yield ProxyService.removeAsync(proxy.proxy_id);
      expect(res).to.be.false;
    });
  });
});
