'use strict';

const utils = require('../lib/utils');
const errors = require('../lib/errors');
const wechat_api = require('../lib/wechat')('proxy', 'system');
const UserService = require('../service').User;
const express = require('../lib/express');

let router = module.exports = express.Router();

// 跳转进行 OAuth
// 由于 OAuth 需要 Referer 不能用 res.redirect
router.get('/oauth', function (req, res) {
  let redirect = '/api/wechat/callback';
  if (req.secure) {
    redirect = utils.getBaseHttpsUrl() + redirect;
  } else {
    redirect = utils.getBaseHttpUrl() + redirect;
  }
  let referer = req.headers.referer || null;
  let usertype = 'member';
  let login_url = wechat_api.getLoginURL(redirect, referer, usertype);
  res.send(`<script>window.location.href='${login_url}'</script>`);
});

// 获取用户信息
router.get('/callback', function* (req, res) {
  let auth_code = req.query.auth_code || '';
  if (!auth_code) {
    throw new errors.BadRequest('微信授权失败...');
  }

  let user;
  try {
    user = yield wechat_api.getLoginUserInfoByCodeAsync(auth_code);
    user = yield wechat_api.getUserAsync(user.user_info.userid);
  } catch (err) {
    throw new errors.BadRequest(err.message);
  }

  // 将微信获取的用户信息更新到数据库
  let user_id = yield UserService.addByWechatAsync(user);

  // 判断用户状态
  user = yield UserService.getAsync(user_id);
  if (!user) {
    throw new errors.SystemError('系统错误，用户信息导入失败');
  } else if (user.is_locked) {
    throw new errors.Forbidden('您的账号已被锁定');
  }

  req.session.user = user;
  res.redirect(req.query.state || '/');
});

// 注销登陆
router.post('/logout', function (req) {
  req.session.user = {};
  throw new errors.Unauthorized('注销登录成功');
});
