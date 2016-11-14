'use strict';

const errors = require('../lib/errors');

let white_list = [
  '/api/wechat/oauth',
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
  let path = req.path;
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 放行非 API 目录
  if (!path.startsWith('/api/')) {
    return next();
  }

  // 放行白名单
  if (white_list.indexOf(path) !== -1) {
    return next();
  }

  // 判断是否登录
  let user = req.session.user;
  if (user && user.user_id) {
    return next();
  }

  throw new errors.Unauthorized('您需要登陆登陆才能访问');
};

module.exports = () => auth;
