'use strict';

const Chance = require('chance');

let chance = new Chance();

module.exports = {
  getUserId() {
    return chance.string();
  },
  getName() {
    return chance.name();
  },
  getGender() {
    return chance.pickone(['男', '女', '未知']);
  },
  getMobile() {
    return chance.phone();
  },
  getEmail() {
    return chance.email();
  },
  getAvatar() {
    return chance.avatar();
  },
};
