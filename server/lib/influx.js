'use strict';

const config = require('config');
const Influx = require('influx');
const {FieldType} = Influx;

let schema = [{
  measurement: 'logs',
  fields: {
    // IP 及归属地信息
    ip: FieldType.STRING,
    country: FieldType.STRING,
    region: FieldType.STRING,
    city: FieldType.STRING,
    isp: FieldType.STRING,

    // 请求信息
    is_complete: FieldType.BOOLEAN,
    status: FieldType.INTEGER,
    method: FieldType.STRING,
    path: FieldType.STRING,

    // 设备信息
    browser_name: FieldType.STRING,
    browser_version: FieldType.STRING,
    engine_name: FieldType.STRING,
    engine_version: FieldType.STRING,
    os_name: FieldType.STRING,
    os_version: FieldType.STRING,
    device_vendor: FieldType.STRING,
    device_model: FieldType.STRING,
    device_type: FieldType.STRING,

    // 速度信息
    bytes: FieldType.INTEGER,
    time: FieldType.FLOAT,
    speed: FieldType.FLOAT,
  },
  tags: [
    'proxy_id',
  ],
}];

let option = Object.assign({schema}, config.influx);
let influx = new Influx.InfluxDB(option);

// 设置保留策略
let {save_days} = config.access_log;
if (save_days > 0) {
  influx.createRetentionPolicy('logs', {
    duration: save_days + 'd',
    replication: 1,
    isDefault: true,
  });
}

module.exports = influx;
