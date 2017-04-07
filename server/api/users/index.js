'use strict';

const express = require('../../lib/express');
const HttpError = require('../../lib/http_error');
const {User} = require('../../service');

let router = module.exports = express.Router();

router.use(function (req, res, next) {
  if (!req.session.user.is_admin) {
    throw new HttpError(HttpError.FORBIDDEN, '无权访问');
  }
  next();
});

router.get('/', function* (req, res) {
  let {key} = req.query;
  let users = yield User.searchAsync(key);
  res.send(users);
});

router.get('/:user_id', function* (req, res) {
  let {user_id} = req.params;
  let user = yield User.getAsync(user_id);
  res.send(user);
});

router.put('/:user_id', function* (req, res) {
  let {user_id} = req.params;
  let user = yield User.updateAsync(user_id, req.body);
  res.send(user);
});
