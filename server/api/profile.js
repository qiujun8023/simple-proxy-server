'use strict';

const express = require('../lib/express');
const {User} = require('../service');

let router = module.exports = express.Router();

router.get('/', function* (req, res) {
  let user_id = req.session.user.user_id;
  let user = yield User.getAsync(user_id);
  res.send(user);
});
