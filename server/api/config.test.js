'use strict';

const {expect} = require('chai');

const BASE_RUL = '/api/config';

describe(BASE_RUL, function () {
  describe('get', function () {
    it('should get config success', function* () {
      let res = yield api
        .get(BASE_RUL)
        .expect(200);
      let keys = ['domain', 'http_port', 'https_port', 'github'];
      expect(res.body).to.include.keys(keys);
    });
  });
});
