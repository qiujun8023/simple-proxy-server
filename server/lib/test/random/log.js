'use strict';

const Chance = require('chance');

let chance = new Chance();

module.exports = {
  getIp() {
    return chance.ip();
  },
  getCountry() {
    return chance.country();
  },
  getRegion() {
    return chance.country({full: true});
  },
  getCity() {
    return chance.city();
  },
  getIsp() {
    return chance.name();
  },
  getIsComplete() {
    return chance.bool();
  },
  getStatus() {
    return chance.pickone([200, 400, 403, 404, 500, 502]);
  },
  getMethod() {
    let methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'];
    return chance.pickone(methods);
  },
  getPath() {
    return chance.url();
  },
  getUa() {
    return chance.name();
  },
  getBytes() {
    return chance.integer({min: 100, max: 10000});
  },
  getTime() {
    return chance.integer({min: 1, max: 1000});
  },
  getSpeed() {
    return chance.integer({min: 100, max: 1000000});
  },
};
