'use strict';

const express = require('../../lib/express');
const HttpError = require('../../lib/http_error');
const {User} = require('../../service');

let router = module.exports = express.Router();

router.get('/', function* (req, res) {
  if (!req.session.user.is_admin) {
    throw new HttpError(HttpError.FORBIDDEN, '无权访问');
  }

  let {key} = req.query;
  let users = yield User.searchAsync(key);
  res.send(users);
});
