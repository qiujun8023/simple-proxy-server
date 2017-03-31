'use strict';

const utility = require('../utility');

class User {
  *before(opts) {
    this.user = yield utility.createTestUserAsync(opts || {});
    return this.user;
  }

  plugin() {
    return (req) => {
      req.set('x-user-id', this.user.user_id);
    };
  }

  *after() {
    return yield utility.removeTestUserAsync(this.user);
  }
}

module.exports = () => new User();
