httpProxy  = require('http-proxy')
express    = require('express')
bodyParser = require('body-parser')
session    = require('express-session')
log4js     = require('log4js')
config     = require(__dirname + '/config')
model      = require(__dirname + '/model')
wechat     = require(__dirname + '/wechat')
action     = require(__dirname + '/action')

# 数据初始化
model.init()
model.schedule()

proxy  = httpProxy.createProxyServer({})
app    = express()
logger = config.logger

# 处理代理异常
proxy.on 'error', (err, req, res) ->
    res.status(500).send
        code: -1
        msg : '处理代理请求时发生异常...'
    logger.error err

# 处理代理
app.use (req, res, next) ->
    host = req.headers.host || ''
    item = model.cache host
    if host is config.domain
        return next()
    else if !item
        return res.redirect "http://#{config.domain}"
    item.value.replace 'http://', ''
    logger.debug "代理访问 #{item.value}"
    proxy.web req, res,
        target: "http://#{item.value}"
    item.count++

# 使用log4j作为日志输出
app.use log4js.connectLogger logger,
    level :'info'
    format:':method :url'

# 处理静态目录
app.use express.static('static')

# 处理JSON
app.use bodyParser.json
    limit: '1mb'
app.use bodyParser.urlencoded
    extended: true

#使用Session
app.use session
    resave: true
    saveUninitialized: true
    secret: 'pwtnmegvwxqtdn'

# 微信授权相关
app.get '/wechat/oauth' , wechat.oauth
app.get '/wechat/result', wechat.result
app.get '/wechat/logout', wechat.logout

# 处理API请求
app.use action.auth
app.get    '/action', action.get
app.post   '/action', action.post
app.put    '/action', action.put
app.delete '/action', action.delete

app.listen config.port, config.host