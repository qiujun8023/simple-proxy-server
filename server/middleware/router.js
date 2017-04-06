'use strict';

const path = require('path');
const glob = require('glob');
const config = require('config');
const auths = require('./auth');
const utils = require('../lib/utils');
const HttpError = require('../lib/http_error');
const express = require('../lib/express');
const isTest = require('../lib/test/is_test');

let router = express.Router();

// 强制 HTTPS
router.use(function (req, res, next) {
  if (config.env === 'production' && !req.secure && config.https.enable) {
    return res.redirect(utils.getBaseHttpsUrl() + req.url);
  }

  next();
});

// API 路由添加安全校验
router.use('/api/*', auths.isLogin());

// 加载 API
let cwd = path.join(__dirname, '..');
glob.sync('api/**/*.js', {cwd}).map(function (file) {
  if (isTest(file)) {
    return;
  }

  let prefix = '/' + file;
  let suffixes = ['/index.js', '.js'];
  for (let suffix of suffixes) {
    if (prefix.endsWith(suffix)) {
      prefix = prefix.slice(0, -suffix.length);
    }
  }

  let location = path.join(cwd, file);
  let handler = require(location);
  router.use(prefix, handler);
});

// Api 错误
router.use('/api/*', function () {
  throw new HttpError(HttpError.NOT_FOUND, 'page not found');
});

// 处理静态目录
router.use(express.static(config.client_dir));
router.get('/*', function (req, res) {
  res.sendFile(path.resolve(config.client_dir, 'index.html'));
});

module.exports = () => router;
