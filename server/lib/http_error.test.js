'use strict';

const {expect} = require('chai');
const HttpError = require('./http_error');

describe('lib/http_error', function () {
  it('should throw bad request error', function* () {
    try {
      throw new HttpError(HttpError.BAD_REQUEST, 'A bad request error');
    } catch (e) {
      expect(e.status).to.equal(400);
    }
  });
});
