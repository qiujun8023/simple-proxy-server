'use strict';

const config = require('config');

let getBaseHttpUrl = function () {
  let port = Number(config.http.port);
  if (port === 80) {
    return `http://${config.domain}`;
  }
  return `http://${config.domain}:${port}`;
};

let getBaseHttpsUrl = function () {
  let port = Number(config.https.port);
  if (port === 443) {
    return `https://${config.domain}`;
  }
  return `https://${config.domain}:${config.https.port}`;
};

module.exports = {
  getBaseHttpUrl,
  getBaseHttpsUrl,
};
