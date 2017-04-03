'use strict';

const config = require('config');
const utility = require('../lib/test/utility');
const random = require('../lib/test/random/proxy');
const SslService = require('./ssl');

describe('service/ssl', function () {
  let proxy;

  before(function* () {
    proxy = yield utility.createTestProxyAsync();
  });

  after(function* () {
    yield utility.removeTestProxyAsync(proxy);
  });

  describe('SNIAsync', function () {
    it('should return error when key and cert not found', function* () {
      try {
        yield SslService.SNIAsync(random.getDomain());
      } catch (e) {
        return;
      }
      throw new Error('should throw SNIA error but not');
    });

    it('should return ctx when key and cert exist', function* () {
      yield SslService.SNIAsync(config.domain);
    });
  });
});
