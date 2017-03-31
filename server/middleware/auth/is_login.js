'use strict';

const path = require('path');
const HttpError = require('../../lib/http_error');
const utils = require('../../lib/utils');

let white_list = [
  '/api/config',
  '/api/wechat/callback',
  '/api/wechat/logout',
];

let auth = function (req, res, next) {
  // 测试时使用
  let user_id = req.get('x-user-id');
  if (user_id) {
    req.session.user = {
      user_id: user_id,
      is_admin: true,
    };
  }

  // 处理请求路径
  let url_path = path.join(req.baseUrl, req.path);
  if (url_path.endsWith('/')) {
    url_path = url_path.slice(0, -1);
  }

  // 放行白名单
  if (white_list.indexOf(url_path) !== -1) {
    return next();
  }

  // 判断是否登录
  let user = req.session.user;
  if (user && user.user_id) {
    return next();
  }

  let referer = req.headers.referer || null;
  let OAuthConfig = utils.getOAuthConfig(req.secure, referer);
  throw new HttpError(HttpError.UNAUTHORIZED, '您需要登陆登陆才能访问', OAuthConfig);
};

module.exports = () => auth;
