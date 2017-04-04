'use strict';

const config = require('config');
const random = require('../lib/test/random/proxy');
const utility = require('../lib/test/utility');

describe('middleware/proxy', function () {
  let user;
  let proxy;

  before(function* () {
    user = yield utility.createTestUserAsync();
    proxy = yield utility.createTestProxyAsync({
      user_id: user.user_id,
      target: 'travis-ci.org',
      target_type: 'HTTPS',
      hostname: 'travis-ci.org',
      proxy_type: 'BOTH',
    });
  });

  after(function* () {
    yield utility.removeTestProxyAsync(proxy);
    yield utility.removeTestUserAsync(user);
  });

  it('should return next if domain in config', function* () {
    yield api
      .get('/')
      .set('Host', config.domain)
      .expect(200);
  });

  it('should return next without host', function* () {
    yield api
      .get('/')
      .expect(200);
  });

  it('should return redirect if domain not found', function* () {
    yield api
      .get('/')
      .set('Host', random.getDomain())
      .expect(302);
  });

  it('should proxy success', function* () {
    this.timeout(20000);
    yield api
      .get('/')
      .set('Host', proxy.domain)
      .expect(200);
  });
});
