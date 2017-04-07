'use strict';

const Chance = require('chance');

let chance = new Chance();

module.exports = {
  getUserId() {
    let pool = '0123456789abcdef';
    return chance.string({pool});
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
