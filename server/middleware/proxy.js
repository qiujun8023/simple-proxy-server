'use strict';

const config = require('config');
const httpProxy = require('http-proxy');

const errors = require('../lib/errors');
const express = require('../lib/express');
const ProxyService = require('../service').Proxy;

let router = express.Router();
let proxy_server = httpProxy.createProxyServer({});

router.use(function* (req, res, next) {
  // 判断是否访问管理后台
  let hostname = req.hostname || '';
  if (hostname === config.domain) {
    return next();
  }

  // 不存在的解析，重定向到管理后台
  let proxy = yield ProxyService.getByDomainAsync(hostname);
  if (!proxy) {
    return res.redirect(`http://${config.domain}`);
  }

  // 判断是否需要重定向
  if (req.secure && proxy.proxy_type === 'HTTP_ONLY') {
    return res.redirect(`http://${req.hostname}${req.url}`);
  } else if (!req.secure && proxy.proxy_type === 'HTTPS_ONLY') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }

  // 发送源 IP 信息
  let remote_address = req.connection.remoteAddress;
  req.headers['x-real-ip'] = remote_address;
  req.headers['x-forwarded-for'] = remote_address;

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

  // 代理访问
  let options = {};
  if (proxy.target_type === 'HTTPS') {
    options.secure = true;
    options.target = `https://${proxy.target}`;
  } else {
    options.target = `http://${proxy.target}`;
  }

  proxy_server.web(req, res, options);
  proxy_server.on('error', function (err) {
    next(new errors.BadGateway(err.message));
  });
});

module.exports = () => router;
