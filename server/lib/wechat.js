'use strict';

const config = require('config');
const Promise = require('bluebird');
const API = require('wechat-enterprise-api');
const redis = require('../lib/redis');

const TOKEN_CACHE_KEY = 'wechat:access_token';

let getToken = function (callback) {
  redis.get(TOKEN_CACHE_KEY, function (err, result) {
    callback(err, JSON.parse(result));
  });
};

let setToken = function (token, callback) {
  let time = token.expiresIn - 600;
  let data = JSON.stringify(token);
  redis.setex(TOKEN_CACHE_KEY, time, data, callback);
};

let {corp_id, secret} = config.wechat;
let api = new API(corp_id, secret, 0, getToken, setToken);
let wechat = module.exports = Promise.promisifyAll(api);

wechat._getToken = getToken;
wechat._setToken = setToken;
