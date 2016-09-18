'use strict';

const config = require('config');

const errors = require('../lib/errors');
const wechat_api = require('../lib/wechat')('proxy', 'system');

let wechat = module.exports = {};

// 跳转进行OAuth
// 由于OAuth需要Referer，不能用res.redirect
wechat.oauth = function* (req, res) {
  let redirect = `http://${config.domain}/wechat/callback`;
  let usertype = 'member';
  let login_url = wechat_api.getLoginURL(redirect, '', usertype);
  res.send(`<script>window.location.href='${login_url}'</script>`);
};

// 获取用户信息
wechat.callback = function* (req, res) {
  let auth_code = req.query.auth_code || '';
  if (!auth_code) {
    throw new errors.BadRequest('微信授权失败...');
  }

  let user;
  try {
    user = yield wechat_api.getLoginUserInfoByCodeAsync(auth_code);
  } catch (err) {
    throw new errors.BadRequest(err.message);
  }

  req.session.user = {
    user_id: user.user_info.userid,
    name: user.user_info.name,
    avatar: user.user_info.avatar.replace('http:', ''),
  };

  res.redirect('/');
};

// 注销登陆
wechat.logout = function* (req, res) {
  req.session.user = {};
  res.redirect('/wechat/oauth');
};
