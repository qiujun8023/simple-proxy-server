'use strict';

const HttpError = require('../../lib/http_error');
const express = require('../../lib/express');
const utils = require('../../lib/utils');

let router = module.exports = express.Router();

// 注销登陆
router.post('/', function (req) {
  req.session.user = {};
  let referer = req.headers.referer || null;
  let OAuthConfig = utils.getOAuthConfig(req.secure, referer);
  throw new HttpError(HttpError.UNAUTHORIZED, '注销登录成功', OAuthConfig);
});
