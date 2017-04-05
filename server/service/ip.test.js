'use strict';

const {expect} = require('chai');
const random = require('../lib/test/random/log');
const IpService = require('./ip');

describe('service/ip', function () {
  describe('getCacheKeyByIp', function () {
    it('should return cache key success', function () {
      let ip = random.getIp();
      let cache_key = IpService.getCacheKeyByIp(ip);
      expect(cache_key).to.equal(IpService._cache_prefix + ip);
    });
  });

  describe('DomainCache', function () {
    let ip = random.getIp();
    let cache_data = {a: 1, b: 2, c: 3};

    it('should set cache success', function* () {
      yield IpService.setCacheByIpAsync(ip, cache_data);
    });

    it('should get cache success', function* () {
      let res = yield IpService.getCacheByIpAsync(ip);
      expect(res).to.deep.equal(cache_data);
    });

    it('should remove cache success', function* () {
      yield IpService.removeCacheByIpAsync(ip);
      let res = yield IpService.getCacheByIpAsync(ip);
      expect(res).to.equal(null);
    });
  });

  describe('getLocationWithCacheAsync', function () {
    let ip;

    it('should get location success', function* () {
      this.timeout(20000);
      ip = random.getIp();
      let location = yield IpService.getLocationWithCacheAsync(ip);
      expect(location).to.include.keys(['country', 'region', 'city', 'isp']);
    });

    it('should get location from cache success', function* () {
      let location = yield IpService.getCacheByIpAsync(ip);
      expect(location).not.to.be.false;
    });

    it('should return false with invalid ip', function* () {
      this.timeout(20000);
      let res = yield IpService.getLocationWithCacheAsync(-1);
      expect(res).to.be.false;
    });
  });
});
