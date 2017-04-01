'use strict';

const path = require('path');
const config = require('config');
const HttpError = require('../../lib/http_error');
const utils = require('../../lib/utils');
const {User} = require('../../service');

let white_list = [
  '/api/config',
  '/api/wechat/callback',
  '/api/wechat/logout',
];

let auth = function* (req, res, next) {
  // 放行白名单
  let url_path = path.resolve(path.join(req.baseUrl, req.path));
  if (white_list.indexOf(url_path) !== -1) {
    return next();
  }

  // 获取用户ID
  let {user_id} = req.session.user || {};
  let tmp_user_id = req.get('x-user-id');
  if (config.env === 'test' && tmp_user_id) {
    user_id = tmp_user_id;
  }

  // 获取用户信息
  let user;
  if (user_id) {
    user = yield User.getAsync(user_id);
  }

  // 判断使用信息是否正常
  if (user_id && user) {
    req.session.user = user;
    if (!user.is_locked) {
      return next();
    }
    throw new HttpError(HttpError.FORBIDDEN, '您的账号已被锁定');
  }

  let referer = req.headers.referer || null;
  let OAuthConfig = utils.getOAuthConfig(req.secure, referer);
  throw new HttpError(HttpError.UNAUTHORIZED, '您需要登陆登陆才能访问', OAuthConfig);
};

module.exports = () => auth;
