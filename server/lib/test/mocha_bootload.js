'use strict';

const supertest = require('supertest-session');
const app = require('../../app');

global.api = supertest(app);
