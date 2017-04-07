'use strict';

const config = require('config');
const {expect} = require('chai');
const utils = require('./utils');

describe('lib/utils', function () {
  describe('getBaseHttpUrl', function () {
    it('should get base http url success', function* () {
      let port = config.http.port;

      config.http.port = 80;
      let res1 = utils.getBaseHttpUrl();
      expect(res1.endsWith('80')).to.be.false;

      config.http.port = 8080;
      let res2 = utils.getBaseHttpUrl();
      expect(res2.endsWith('8080')).to.be.true;

      config.http.port = port;
    });
  });

  describe('getBaseHttpsUrl', function () {
    it('should get base https url success', function* () {
      let port = config.https.port;

      config.https.port = 443;
      let res1 = utils.getBaseHttpsUrl();
      expect(res1.endsWith('443')).to.be.false;

      config.https.port = 8443;
      let res2 = utils.getBaseHttpsUrl();
      expect(res2.endsWith('8443')).to.be.true;

      config.https.port = port;
    });
  });

  describe('getOAuthConfig', function () {
    it('should get oauth config success', function* () {
      let state = '/';
      let keys = ['corp_id', 'redirect_uri', 'state', 'usertype'];

      let res1 = utils.getOAuthConfig(false, state);
      expect(res1.redirect_uri.startsWith('http://')).to.be.true;
      expect(res1).to.include.keys(keys);

      let res2 = utils.getOAuthConfig(true, state);
      expect(res2.redirect_uri.startsWith('https://')).to.be.true;
      expect(res2).to.include.keys(keys);
    });
  });
});
