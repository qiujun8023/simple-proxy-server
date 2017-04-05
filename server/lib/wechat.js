'use strict';

const config = require('config');
const Promise = require('bluebird');
const API = require('wechat-enterprise-api');
const redis = require('../lib/redis');

const TOKEN_CACHE_KEY = 'wechat:access_token';

let wechat = module.exports = {};

wechat._getToken = function (callback) {
  redis.get(TOKEN_CACHE_KEY, function (err, result) {
    callback(err, JSON.parse(result));
  });
};

wechat._setToken = function (token, callback) {
  let time = token.expiresIn - 600;
  let data = JSON.stringify(token);
  redis.setex(TOKEN_CACHE_KEY, time, data, callback);
};

let {corp_id, secret} = config.wechat;
let api = new API(corp_id, secret, 0, wechat._getToken, wechat._setToken);
wechat = Promise.promisifyAll(api);
