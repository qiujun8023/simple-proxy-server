'use strict';

const {expect} = require('chai');
const random = require('../lib/test/random/log');
const LogService = require('./log');

let randomLog = function () {
  return {
    proxy_id: -1,
    ip: random.getIp(),
    status: random.getStatus(),
    method: random.getMethod(),
    path: random.getPath(),
    user_agent: random.getUserAgent(),
    bytes: random.getBytes(),
    cost: random.getCost(),
    speed: random.getSpeed(),
  };
};

describe('service/log', function () {
  let log = randomLog();

  describe('Queue', function () {
    it('shoud emptied queue success', function* () {
      // eslint-disable-next-line
      while (yield LogService.popQueueAsync(1));
    });

    it('should push queue success', function* () {
      let res = yield LogService.pushQueueAsync(log);
      expect(res).to.be.true;
    });

    it('should pop queue success', function* () {
      let tmp_log = yield LogService.popQueueAsync();
      expect(tmp_log).to.deep.equal(log);
    });
  });

  describe('addAsync', function () {
    it('should add log success', function* () {
      let res = yield LogService.addAsync(log);
      expect(res).to.be.true;
    });
  });
});
