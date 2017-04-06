'use strict';

const url = require('url');
const config = require('config');
const Promise = require('bluebird');

// 获取 HTTP 地址前缀
let getBaseHttpUrl = function () {
  let port = Number(config.http.port);
  if (port === 80) {
    return `http://${config.domain}`;
  }
  return `http://${config.domain}:${port}`;
};

// 获取 HTTPS 地址前缀
let getBaseHttpsUrl = function () {
  let port = Number(config.https.port);
  if (port === 443) {
    return `https://${config.domain}`;
  }
  return `https://${config.domain}:${config.https.port}`;
};

// 获取 OAuth 2.0 配置信息
let getOAuthConfig = function (secure, state) {
  let redirect_uri = '/api/wechat/callback';
  // 开发环境下使用前端的 protocal 与 host ，方便开发
  if (config.env === 'development' && state && state.startsWith('http:')) {
    let result = url.parse(state);
    redirect_uri = url.format({
      protocol: result.protocol,
      host: result.host,
      pathname: redirect_uri,
    });
  } else if (secure) {
    redirect_uri = this.getBaseHttpsUrl() + redirect_uri;
  } else {
    redirect_uri = this.getBaseHttpUrl() + redirect_uri;
  }

  let {corp_id, usertype} = config.wechat;
  return {corp_id, redirect_uri, state, usertype};
};

let sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  getBaseHttpUrl,
  getBaseHttpsUrl,
  getOAuthConfig,
  sleep,
};
