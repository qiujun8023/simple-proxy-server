'use strict';

const config = require('config');
const Influx = require('influx');

const {FieldType} = Influx;
const MEASUREMENTS = {
  RAW: 'raw',
  LOCATION: 'location',
  BROWSER: 'browser',
  OS: 'os',
  DEVICE: 'device',
};
const RETENTION_POLICY_NAME = 'logs_save';
const RETENTION_POLICY_OPTIONS = {
  duration: config.access_log.save_days + 'd',
  replication: 1,
  isDefault: true,
};

let schema = [
  {
    measurement: MEASUREMENTS.RAW,
    fields: {
      status: FieldType.INTEGER,
      bytes: FieldType.INTEGER,
      cost: FieldType.FLOAT,
      speed: FieldType.FLOAT,
    },
    tags: ['proxy_id', 'ip', 'status', 'method', 'path'],
  },
  {
    measurement: MEASUREMENTS.LOCATION,
    fields: {sentinel: FieldType.BOOLEAN},
    tags: ['proxy_id', 'country', 'region', 'city', 'isp'],
  },
  {
    measurement: MEASUREMENTS.BROWSER,
    fields: {sentinel: FieldType.BOOLEAN},
    tags: ['proxy_id', 'name', 'version'],
  },
  {
    measurement: MEASUREMENTS.OS,
    fields: {sentinel: FieldType.BOOLEAN},
    tags: ['proxy_id', 'name', 'version'],
  },
  {
    measurement: MEASUREMENTS.DEVICE,
    fields: {sentinel: FieldType.BOOLEAN},
    tags: ['proxy_id', 'vendor', 'model', 'type'],
  },
];

let option = Object.assign({schema}, config.influx);
let influx = new Influx.InfluxDB(option);

// 设置保留策略
influx.createRetentionPolicy(
  RETENTION_POLICY_NAME,
  RETENTION_POLICY_OPTIONS
).catch(function () {
  influx.alterRetentionPolicy(
    RETENTION_POLICY_NAME,
    RETENTION_POLICY_OPTIONS
  );
});

influx.MEASUREMENTS = MEASUREMENTS;
module.exports = influx;
