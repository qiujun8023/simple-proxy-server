'use strict';

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);

    this.status = status;
    this.extra = extra || {};
  }

  static get BAD_REQUEST() {
    return 400;
  }

  static get UNAUTHORIZED() {
    return 401;
  }

  static get PAYMENT_REQUIRED() {
    return 402;
  }

  static get FORBIDDEN() {
    return 403;
  }

  static get NOT_FOUND() {
    return 404;
  }

  static get METHOD_NOT_ALLOWED() {
    return 405;
  }

  static get NOT_ACCEPTABLE() {
    return 406;
  }

  static get PROXY_AUTHENTICATION_REQUIRED() {
    return 407;
  }

  static get REQUEST_TIMEOUT() {
    return 408;
  }

  static get CONFLICT() {
    return 409;
  }

  static get GONE() {
    return 410;
  }

  static get LENGTH_REQUIRED() {
    return 411;
  }

  static get PRECONDITION_FAILED() {
    return 412;
  }

  static get REQUEST_TOO_LONG() {
    return 413;
  }

  static get REQUEST_URI_TOO_LONG() {
    return 414;
  }

  static get UNSUPPORTED_MEDIA_TYPE() {
    return 415;
  }

  static get REQUESTED_RANGE_NOT_SATISFIABLE() {
    return 416;
  }

  static get EXPECTATION_FAILED() {
    return 417;
  }

  static get INSUFFICIENT_SPACE_ON_RESOURCE() {
    return 419;
  }

  static get METHOD_FAILURE() {
    return 420;
  }

  static get LOCKED() {
    return 423;
  }

  static get FAILED_DEPENDENCY() {
    return 424;
  }

  static get PRECONDITION_REQUIRED() {
    return 428;
  }

  static get TOO_MANY_REQUESTS() {
    return 429;
  }

  static get UNPROCESSABLE_ENTITY() {
    return 422;
  }

  static get REQUEST_HEADER_FIELDS_TOO_LARGE() {
    return 431;
  }

  static get INTERNAL_SERVER_ERROR() {
    return 500;
  }

  static get NOT_IMPLEMENTED() {
    return 501;
  }

  static get BAD_GATEWAY() {
    return 502;
  }

  static get SERVICE_UNAVAILABLE() {
    return 503;
  }

  static get GATEWAY_TIMEOUT() {
    return 504;
  }

  static get HTTP_VERSION_NOT_SUPPORTED() {
    return 505;
  }

  static get INSUFFICIENT_STORAGE() {
    return 507;
  }

  static get NETWORK_AUTHENTICATION_REQUIRED() {
    return 511;
  }

}

module.exports = HttpError;
