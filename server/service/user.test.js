'use strict';

const _ = require('lodash');
const {expect} = require('chai');
const random = require('../lib/test/random/user');
const UserService = require('./user');

describe('service/user', function () {
  let user;

  describe('addByWechatAsync', function () {
    it('should add user success', function* () {
      let option = {
        userid: random.getUserId(),
        name: random.getName(),
        gender: _.random(0, 2),
        mobile: random.getMobile(),
        email: random.getEmail(),
        avatar: random.getAvatar(),
      };
      user = yield UserService.addByWechatAsync(option);
      expect(user.user_id).to.equal(option.userid);
      expect(user.name).to.equal(option.name);
    });
  });

  describe('upsertAsync', function () {
    it('should upsert user success', function* () {
      let name = user.name = random.getName();
      user = yield UserService.upsertAsync(user);
      expect(user.name).to.equal(name);
    });
  });

  describe('updateAsync', function () {
    it('should return false if user not found', function* () {
      let user_id = random.getUserId();
      let res = yield UserService.updateAsync(user_id, {});
      expect(res).to.be.false;
    });

    it('should update user success', function* () {
      let name = random.getName();
      user = yield UserService.updateAsync(user.user_id, {name});
      expect(user.name).to.equal(name);
    });
  });

  describe('searchAsync', function () {
    it('should return user list success', function* () {
      let list = yield UserService.searchAsync(user.user_id);
      expect(list).to.be.instanceof(Array);
      expect(list.length).to.equal(1);
      expect(list[0].name).to.equal(user.name);
    });
  });

  describe('getAsync', function () {
    it('should return false if user not found', function* () {
      let user_id = random.getUserId();
      let res = yield UserService.getAsync(user_id);
      expect(res).to.be.false;
    });

    it('should get user success', function* () {
      let tmp_user = yield UserService.getAsync(user.user_id);
      expect(tmp_user.user_id).to.equal(user.user_id);
      expect(tmp_user.name).to.equal(user.name);
    });
  });

  describe('removeAsync', function () {
    it('should remove user success', function* () {
      yield UserService.removeAsync(user.user_id);
      let res = yield UserService.getAsync(user.user_id);
      expect(res).to.be.false;
    });

    it('should return false if user not found', function* () {
      let res = yield UserService.removeAsync(user.user_id);
      expect(res).to.be.false;
    });
  });
});
