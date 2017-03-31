'use strict';

const config = require('config');

let getBaseHttpUrl = function () {
  let port = Number(config.http.port);
  if (port === 80) {
    return `http://${config.domain}`;
  }
  return `http://${config.domain}:${port}`;
};

let getBaseHttpsUrl = function () {
  let port = Number(config.https.port);
  if (port === 443) {
    return `https://${config.domain}`;
  }
  return `https://${config.domain}:${config.https.port}`;
};

let getOAuthConfig = function (secure, state) {
  let redirect_uri = 'http://proxy.dev:8090/api/wechat/callback';
  // if (secure) {
  //   redirect_uri = this.getBaseHttpsUrl() + redirect_uri;
  // } else {
  //   redirect_uri = this.getBaseHttpUrl() + redirect_uri;
  // }

  let {corp_id, usertype} = config.wechat;
  return {corp_id, redirect_uri, state, usertype};
};

module.exports = {
  getBaseHttpUrl,
  getBaseHttpsUrl,
  getOAuthConfig,
};
