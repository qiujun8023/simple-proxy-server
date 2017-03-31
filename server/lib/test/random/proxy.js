'use strict';

const Chance = require('chance');

let chance = new Chance();

module.exports = {
  getUserId() {
    return chance.string();
  },
  getDomain() {
    return chance.domain();
  },
  getMark() {
    return chance.string();
  },
  getTargetType() {
    return chance.pickone(['HTTP', 'HTTPS']);
  },
  getProxyType() {
    return chance.pickone(['BOTH', 'HTTP_ONLY', 'HTTPS_ONLY']);
  },
  getCert() {
    return chance.string({length: 500});
  },
  getKey() {
    return chance.string({length: 500});
  },
};
