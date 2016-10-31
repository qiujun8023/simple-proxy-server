'use strict';

const path = require('path');

const glob = require('glob');
const config = require('config');

const utils = require('../lib/utils');
const errors = require('../lib/errors');
const express = require('../lib/express');
const isTest = require('../lib/test/is_test');

let router = express.Router();

// 强制 HTTPS
router.use(function (req, res, next) {
  if (config.env !== 'test' && !req.secure && config.https.enable) {
    return res.redirect(utils.getBaseHttpsUrl() + req.url);
  }

  next();
});

// 添加所有的API路由
let cwd = path.join(__dirname, '..');
glob.sync('api/**/*.js', {cwd}).map(function (file) {
  if (isTest(file)) {
    return;
  }

  let prefix = '/' + file.slice(0, -'.js'.length);
  let location = path.join(cwd, file);
  let handler = require(location);
  router.use(prefix, handler);
});

// 处理静态目录
router.use(express.static(config.client_dir));
router.get('/*', function (req, res) {
  res.sendFile(path.resolve(config.client_dir, 'index.html'));
});

// 404 错误
router.use(function () {
  throw new errors.NotFound('page not found');
});

module.exports = () => router;
