'use strict';

const {expect} = require('chai');
const HttpError = require('./http_error');

describe('lib/http_error', function () {
  it('should throw bad request error', function () {
    try {
      throw new HttpError(HttpError.BAD_REQUEST, 'A bad request error');
    } catch (e) {
      expect(e.status).to.equal(400);
    }
  });

  it('should return the correct code', function () {
    let codes = {
      BAD_GATEWAY: 502,
      BAD_REQUEST: 400,
      CONFLICT: 409,
      EXPECTATION_FAILED: 417,
      FAILED_DEPENDENCY: 424,
      FORBIDDEN: 403,
      GATEWAY_TIMEOUT: 504,
      GONE: 410,
      HTTP_VERSION_NOT_SUPPORTED: 505,
      INSUFFICIENT_SPACE_ON_RESOURCE: 419,
      INSUFFICIENT_STORAGE: 507,
      INTERNAL_SERVER_ERROR: 500,
      LENGTH_REQUIRED: 411,
      LOCKED: 423,
      METHOD_FAILURE: 420,
      METHOD_NOT_ALLOWED: 405,
      NETWORK_AUTHENTICATION_REQUIRED: 511,
      NOT_ACCEPTABLE: 406,
      NOT_FOUND: 404,
      NOT_IMPLEMENTED: 501,
      PAYMENT_REQUIRED: 402,
      PRECONDITION_FAILED: 412,
      PRECONDITION_REQUIRED: 428,
      PROXY_AUTHENTICATION_REQUIRED: 407,
      REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
      REQUEST_TIMEOUT: 408,
      REQUEST_TOO_LONG: 413,
      REQUEST_URI_TOO_LONG: 414,
      REQUESTED_RANGE_NOT_SATISFIABLE: 416,
      SERVICE_UNAVAILABLE: 503,
      TOO_MANY_REQUESTS: 429,
      UNAUTHORIZED: 401,
      UNPROCESSABLE_ENTITY: 422,
      UNSUPPORTED_MEDIA_TYPE: 415,
    };

    for (let key in codes) {
      expect(HttpError[key]).to.equal(codes[key]);
    }
  });
});
