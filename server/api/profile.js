'use strict';

const express = require('../lib/express');

let router = module.exports = express.Router();

router.get('/', function* (req, res) {
  res.send(req.session.user);
});
