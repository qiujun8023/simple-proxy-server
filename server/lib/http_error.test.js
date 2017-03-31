'use strict';

const expect = require('chai').expect;

const HttpError = require('./http_error');

describe('server/lib/http_error', function () {
  it('should throw BadRequest error', function* () {
    try {
      throw new HttpError(HttpError.BAD_REQUEST, 'A BadRequest Error');
    } catch (e) {
      expect(e.status).to.equal(400);
    }
  });
});
