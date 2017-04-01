'use strict';

const {User} = require('../../service');
const HttpError = require('../../lib/http_error');
const wechat = require('../../lib/wechat');
const express = require('../../lib/express');

let router = module.exports = express.Router();

// 获取用户信息
router.get('/', function* (req, res) {
  let auth_code = req.query.auth_code || '';
  if (!auth_code) {
    throw new HttpError(HttpError.BAD_REQUEST, '微信授权失败...');
  }

  let user;
  try {
    user = yield wechat.getLoginUserInfoByCodeAsync(auth_code);
    user = yield wechat.getUserAsync(user.user_info.userid);
  } catch (err) {
    throw new HttpError(HttpError.BAD_REQUEST, err.message);
  }

  // 将微信获取的用户信息更新到数据库
  user = yield User.addByWechatAsync(user);
  if (!user) {
    throw new HttpError(HttpError.INTERNAL_SERVER_ERROR, '系统错误，用户信息导入失败');
  } else if (user.is_locked) {
    throw new HttpError(HttpError.FORBIDDEN, '您的账号已被锁定');
  }

  req.session.user = user;
  res.redirect(req.query.state || '/');
});
