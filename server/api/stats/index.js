'use strict';

const moment = require('moment');
const express = require('../../lib/express');
const statsAuth = require('../../middleware/auth/stats');
const {Log} = require('../../service');

let router = module.exports = express.Router();

router.use(statsAuth());

router.get('/flow', function* (req, res) {
  let {proxy_ids, start_day, end_day} = req.query;
  let flow = yield Log.findFlowAsync(proxy_ids, start_day, end_day);
  let request = yield Log.findRequestAsync(proxy_ids, start_day, end_day);

  let data = [];
  for (let i = 0; i < flow.length; i++) {
    data.push({
      flow: flow[i].total || 0,
      request: request[i].count,
      time: moment(flow[i].time).format('MM-DD HH:mm'),
    });
  }
  res.send(data);
});

router.get('/speed', function* (req, res) {
  let {proxy_ids, start_day, end_day} = req.query;
  let speeds = yield Log.findSpeedAsync(proxy_ids, start_day, end_day);
  for (let speed of speeds) {
    speed.value = speed.value || 0;
    speed.time = moment(speed.time).format('MM-DD HH:mm');
  }
  res.send(speeds);
});

router.get('/:type(region|city|isp)', function* (req, res) {
  let {type} = req.params;
  let {proxy_ids, start_day, end_day} = req.query;
  let data = yield Log.findAreaAsync(proxy_ids, start_day, end_day, type);
  res.send(data);
});

router.get('/device', function* (req, res) {
  let {proxy_ids, start_day, end_day} = req.query;
  let data = yield Log.findDeviceAsync(proxy_ids, start_day, end_day);
  res.send(data);
});

router.get('/os', function* (req, res) {
  let {proxy_ids, start_day, end_day} = req.query;
  let data = yield Log.findOsAsync(proxy_ids, start_day, end_day);
  res.send(data);
});

router.get('/status', function* (req, res) {
  let {proxy_ids, start_day, end_day} = req.query;
  let data = yield Log.findStatusAsync(proxy_ids, start_day, end_day);
  res.send(data);
});
