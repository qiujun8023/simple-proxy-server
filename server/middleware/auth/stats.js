'use strict';

const _ = require('lodash');
const HttpError = require('../../lib/http_error');
const {Proxy} = require('../../service');

module.exports = () => {
  return function* (req, res, next) {
    let {user_id, is_admin} = req.session.user;
    // 处理 user_id
    if (!req.query.user_id || !is_admin && req.query.user_id) {
      req.query.user_id = user_id;
    } else {
      user_id = req.query.user_id;
    }

    // 处理 proxy_id
    let {proxy_id} = req.query;
    if (proxy_id) {
      let proxy = yield Proxy.getAsync(proxy_id);
      if (!proxy || user_id !== proxy.user_id) {
        throw new HttpError(HttpError.NOT_FOUND, '数据未找到');
      }
      req.query.proxy_ids = [proxy_id];
    } else {
      let proxys = yield Proxy.findAsync({user_id});
      req.query.proxy_ids = _.map(proxys, 'proxy_id');
    }

    // 处理 start_day 与 end_day
    req.query.start_day = Number(req.query.start_day || 0);
    req.query.end_day = Number(req.query.end_day || 0);

    next();
  };
};
