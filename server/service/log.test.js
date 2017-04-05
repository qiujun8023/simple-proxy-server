'use strict';

const {expect} = require('chai');
const random = require('../lib/test/random/log');
const LogService = require('./log');

describe('service/log', function () {
  let log;

  describe('getCacheKeyByIp', function () {
    it('should add log success', function* () {
      let options = {
        proxy_id: -1,
        ip: random.getIp(),
        is_complete: random.getIsComplete(),
        status: random.getStatus(),
        method: random.getMethod(),
        path: random.getPath(),
        ua: random.getUa(),
        bytes: random.getBytes(),
        time: random.getTime(),
        speed: random.getSpeed(),
      };
      log = yield LogService.addAsync(options);
      expect(log.ip).to.equal(options.ip);
      expect(log.method).to.equal(options.method);
    });
  });

  describe('getAsync', function () {
    it('should return false if log not found', function* () {
      let res = yield LogService.getAsync(-1);
      expect(res).to.be.false;
    });

    it('should get log success', function* () {
      let tmp_log = yield LogService.getAsync(log.log_id);
      expect(tmp_log.log_id).to.equal(log.log_id);
      expect(tmp_log.proxy_id).to.equal(log.proxy_id);
    });
  });

  describe('findNeedUpdateAsync', function () {
    it('should return ips list success', function* () {
      let ips = yield LogService.findNeedUpdateAsync(99999999);
      expect(ips).to.be.instanceof(Array);
      expect(log.ip).to.be.oneOf(ips);
    });
  });

  describe('updateByIpAsync', function () {
    it('should update log success', function* () {
      let data = {
        country: random.getCountry(),
        region: random.getRegion(),
        city: random.getCity(),
        isp: random.getIsp(),
      };
      yield LogService.updateByIpAsync(log.ip, data);
      log = yield LogService.getAsync(log.log_id);
      expect(log.country).to.equal(data.country);
      expect(log.region).to.equal(data.region);
      expect(log.city).to.equal(data.city);
      expect(log.isp).to.equal(data.isp);
    });
  });

  describe('removeAsync', function () {
    it('should remove log success', function* () {
      yield LogService.removeAsync(log.log_id);
      let res = yield LogService.getAsync(log.log_id);
      expect(res).to.be.false;
    });

    it('should return false if log not found', function* () {
      let res = yield LogService.removeAsync(log.log_id);
      expect(res).to.be.false;
    });
  });

  describe('deleteByTimeAsync', function () {
    it('should delete logs success', function* () {
      yield LogService.deleteByTimeAsync(9999);
    });
  });
});
