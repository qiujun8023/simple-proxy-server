'use strict';

const config = require('config');

const routers = require('../router');
const errors = require('../lib/errors');
const express = require('../lib/express');

let router = express.Router();

// 判断是否需要开启 HTTPS
router.use(function (req, res, next) {
  if (config.env !== 'test' && !req.secure && config.https.enable) {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

// 处理静态目录
router.use(express.static(config.client_dir));

// 微信授权相关
let wechat = routers.wechat;
router.get('/wechat/oauth', wechat.oauth);
router.get('/wechat/callback', wechat.callback);
router.get('/wechat/logout', wechat.logout);

// 处理API请求
let action = routers.action;
router.all('/action', action.auth);
router.get('/action', action.get);
router.post('/action', action.post);
router.put('/action', action.put);
router.delete('/action', action.delete);

// 404 错误
router.use(function () {
  throw new errors.NotFound('page not found');
});

module.exports = () => router;
