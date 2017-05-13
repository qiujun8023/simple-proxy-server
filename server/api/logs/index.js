'use strict';

const express = require('../../lib/express');
const statsAuth = require('../../middleware/auth/stats');
const {Log} = require('../../service');

let router = module.exports = express.Router();

router.use(statsAuth());

router.get('/:type(slow|error|hot|hot_ip)', function* (req, res) {
  let asyncFunc = {
    slow: 'findSlowAsync',
    error: 'findErrorAsync',
    hot: 'findHotAsync',
    hot_ip: 'findHotIpAsync',
  }[req.params.type];

  let {proxy_ids, start_day, end_day} = req.query;
  let data = yield Log[asyncFunc](proxy_ids, start_day, end_day);
  res.send(data);
});
