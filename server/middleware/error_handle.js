'use strict';

const config = require('config');
const HttpError = require('../lib/http_error');
const logger = require('../lib/logger');

module.exports = function () {
  // eslint-disable-next-line
  return function (err, req, res, next) {
    if (typeof err === 'string') {
      err = {message: err};
    }

    if (!(err instanceof HttpError) || config.debug) {
      logger.error(err);
    }

    let answer = {extra: err.extra};
    answer.message = err.message;
    answer.request = err.request || req.path;
    res.status(err.status || 500).send(answer);
  };
};
