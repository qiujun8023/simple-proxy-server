'use strict';

const express = require('../../lib/express');

let router = module.exports = express.Router();

router.get('/', function* (req, res) {
  res.send('users');
});

router.get('/:user_id', function* (req, res) {
  let user_id = req.params.user_id;
  res.send(user_id);
});
