'use strict';

const isTest = require('../lib/test/is_test');

require('moder')(__dirname, {
  naming: 'pascal',
  lazy: false,
  exports,
  filter: isTest,
});

exports.Proxy.sync();
exports.Ssl.sync();
exports.User.sync();
exports.Log.sync();

// 用户与代理关系
exports.User.hasMany(exports.Proxy, {
  foreignKey: 'user_id',
  constraints: false,
});
exports.Proxy.belongsTo(exports.User, {
  foreignKey: 'user_id',
  constraints: false,
});

// 代理与证书关系
exports.Proxy.hasOne(exports.Ssl, {
  foreignKey: 'proxy_id',
  constraints: false,
});
exports.Ssl.belongsTo(exports.Proxy, {
  foreignKey: 'proxy_id',
  constraints: false,
});

// 代理与日志关系
exports.Proxy.hasMany(exports.Log, {
  foreignKey: 'proxy_id',
  constraints: false,
});
exports.Log.belongsTo(exports.Proxy, {
  foreignKey: 'proxy_id',
  constraints: false,
});
