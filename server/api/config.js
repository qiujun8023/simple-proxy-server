'use strict';

const config = require('config');

const express = require('../lib/express');

let router = module.exports = express.Router();

router.get('/', function (req, res) {
  res.send({
    domain: config.domain || config.host,
    http_port: config.http.port,
    https_port: config.https.enable ? config.https.port : null,
  });
});
