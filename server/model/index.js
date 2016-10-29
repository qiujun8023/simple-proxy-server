const isTest = require('../lib/test/is_test');

require('moder')(__dirname, {
  naming: 'pascal',
  lazy: false,
  exports,
  filter: isTest,
});

exports.Proxy.sync();
exports.User.sync();

exports.User.hasMany(exports.Proxy, {
  foreignKey: 'user_id',
});
exports.Proxy.belongsTo(exports.User, {
  foreignKey: 'user_id',
});
