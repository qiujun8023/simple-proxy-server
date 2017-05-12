'use strict';

const Chance = require('chance');
const random_ua = require('random-ua');

let chance = new Chance();

module.exports = {
  getIp() {
    return chance.ip();
  },
  getStatus() {
    return chance.pickone([200, 400, 403, 404, 500, 502]);
  },
  getMethod() {
    return chance.pickone(['GET', 'POST', 'PUT', 'DELETE']);
  },
  getPath() {
    return chance.url();
  },
  getUserAgent() {
    return random_ua.generate();
  },
  getBytes() {
    return chance.integer({min: 100, max: 10000});
  },
  getCost() {
    return chance.integer({min: 1, max: 1000});
  },
  getSpeed() {
    return chance.integer({min: 100, max: 1000000});
  },
};
