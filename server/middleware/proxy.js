'use strict';

const config = require('config');
const httpProxy = require('http-proxy');
const utils = require('../lib/utils');
const HttpError = require('../lib/http_error');
const express = require('../lib/express');
const {Proxy} = require('../service');

let router = express.Router();
let proxy_server = httpProxy.createProxyServer({});

router.use(function* (req, res, next) {
  // 判断是否访问管理后台及测试环境
  let hostname = req.hostname || '';
  if (hostname === config.domain) {
    return next();
  } else if (hostname === '127.0.0.1' && config.env === 'test') {
    return next();
  }

  // 不存在的解析，重定向到管理后台
  let proxy = yield Proxy.getNormalByDomainAsync(hostname);
  if (!proxy) {
    return res.redirect(utils.getBaseHttpUrl());
  }

  // 判断是否需要重定向
  if (req.secure && proxy.proxy_type === 'HTTP_ONLY') {
    return res.redirect(`http://${req.hostname}${req.url}`);
  } else if (!req.secure && proxy.proxy_type === 'HTTPS_ONLY') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }

  // 设置请求头
  req.headers['x-proxy-id'] = proxy.proxy_id;
  req.headers['x-real-ip'] = req.ip;
  req.headers['x-forwarded-for'] = req.ip;
  req.headers['x-forwarded-proto'] = req.protocol;

  // 设置回源域名，设置当前端口
  let port = req.headers['host'].split(':')[1];
  if (!port && !req.secure) {
    port = config.http.port;
  } else if (!port) {
    port = config.https.port;
  }
  req.headers['host'] = `${proxy.hostname}:${port}`;

  // 修改 rawHeaders
  req.rawHeaders = [];
  for (let key in req.headers) {
    req.rawHeaders.push(key, req.headers[key]);
  }

  // 构造访问信息
  let options = {};
  if (proxy.target_type === 'HTTPS') {
    options.secure = true;
    options.target = `https://${proxy.target}`;
  } else {
    options.target = `http://${proxy.target}`;
  }

  // 代理访问
  proxy_server.web(req, res, options, function (err) {
    next(new HttpError(HttpError.BAD_GATEWAY, err.message));
  });
});

module.exports = () => router;
