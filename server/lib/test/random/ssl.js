'use strict';

const Chance = require('chance');

let chance = new Chance();

module.exports = {
  getCert() {
    return chance.string({length: 500});
  },
  getKey() {
    return chance.string({length: 500});
  },
};
