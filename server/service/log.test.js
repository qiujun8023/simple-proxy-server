'use strict';

const {expect} = require('chai');
const LogService = require('./log');
const utility = require('../lib/test/utility');

describe('service/log', function () {
  let log = utility.generateLog();

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
    this.timeout(5000);
    it('should add log success', function* () {
      let res = yield LogService.addAsync(log);
      expect(res).to.be.true;
    });
  });
});
