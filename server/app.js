'use strict';

// eslint-disable-next-line
process.env.NODE_CONFIG_DIR= __dirname +'/config';

const http = require('http');
const https = require('https');

const co = require('co');
const config = require('config');
const bodyParser = require('body-parser');

const app = require('./lib/express')();
const mws = require('./middleware');
const ProxyService = require('./service').Proxy;

// 处理代理
app.use(mws.proxy());

// 处理 Body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// 加载 Session
app.use(mws.session());

// 加载路由
app.use(mws.router());

// 错误处理
app.use(mws.errorHandle());

if (!module.parent) {
  let http_server = http.createServer(app);
  http_server.listen(config.http.port, config.host);
  // eslint-disable-next-line
  console.log(`Server listen on http://${config.domain}:${config.http.port}`);

  if (config.https.enable) {
    let https_server = https.createServer({
      // HTTPS SNI 回调
      SNICallback: function (domain, cb) {
        co(function* () {
          return yield ProxyService.SNIAsync(domain);
        }).then((ctx) => cb(null, ctx)).catch(cb);
      },
    }, app);
    https_server.listen(config.https.port, config.host);
    // eslint-disable-next-line
    console.log(`Server listen on https://${config.domain}:${config.https.port}`);
  }
} else {
  module.exports = http.createServer(app);
}
