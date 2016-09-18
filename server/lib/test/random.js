'use strict';

const Chance = require('chance');

let chance = new Chance();

module.exports = chance;

chance.proxy = {
  getUserId() {
    return chance.string();
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
