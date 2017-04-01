'use strict';

const HttpError = require('../../lib/http_error');
const express = require('../../lib/express');

let router = module.exports = express.Router();

// 注销登陆
router.post('/', function (req) {
  req.session.user = {};
  throw new HttpError(HttpError.UNAUTHORIZED, '注销登录成功');
});
