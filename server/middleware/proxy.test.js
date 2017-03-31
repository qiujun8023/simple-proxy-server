'use strict';

const random = require('../lib/test/random/proxy');
const utility = require('../lib/test/utility');

describe('server/middleware/proxy', function () {
  let proxy;

  before(function* () {
    proxy = yield utility.createTestProxyAsync({
      target: 'www.taobao.com',
      target_type: 'HTTPS',
      hostname: 'www.taobao.com',
      proxy_type: 'BOTH',
    });
  });

  after(function* () {
    yield utility.removeTestProxyAsync(proxy);
  });

  it('should return redirect if domain not found', function* () {
    yield api
      .get('/')
      .set('Host', random.getDomain())
      .expect(302);
  });

  it('should proxy success', function* () {
    yield api
      .get('/')
      .set('Host', proxy.domain)
      .expect(200);
  });
});
