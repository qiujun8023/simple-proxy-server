request = require('request')
config  = require(__dirname + '/config')

module.exports = wechat = {}

# 由于网站请求少，不缓存AccessToken
wechat.getAccessToken = (callback) ->
    corpId = config.wechat.corpId
    secret = config.wechat.secret
    url    = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=#{corpId}&corpsecret=#{secret}"
    request url, (err, response, body) ->
        # 判断是否出错
        if err then return callback err

        # 解析JSON
        try
            body = JSON.parse body
        catch error
            logger.error "JSON解析失败：", body
            return callback "JSON解析失败"

        # 判断是否请求成功
        if body.errcode
            return callback body.errmsg
        return callback null, body.access_token

wechat.getUserInfo = (authCode, callback) ->
    wechat.getAccessToken (err, accessToken) ->
        if err then return callback err
        url = "https://qyapi.weixin.qq.com/cgi-bin/service/get_login_info?access_token=#{accessToken}"
        request.post
            url : url
            form: '{"auth_code":"' + authCode + '"}'
        , (err, response, body) ->
            # 判断是否出错
            if err then return callback err

            # 解析JSON
            try
                body = JSON.parse body
            catch error
                logger.error "JSON解析失败：", body
                return callback "JSON解析失败"

            # 判断是否请求成功
            if body.errcode
                return callback body.errmsg
            return callback null, body.user_info

# 跳转进行OAuth
# 由于OAuth需要Referer，不能用res.redirect
wechat.oauth  = (req, res) ->
    if req.session.user?.sid
        return res.redirect '/'
    # 使用Javascript进行跳转
    corpId   = config.wechat.corpId
    redirect = "http%3a%2f%2f#{config.domain}/wechat/result"
    usertype = 'member'
    href     = "https://qy.weixin.qq.com/cgi-bin/loginpage?corp_id=#{corpId}&redirect_uri=#{redirect}&usertype=#{usertype}"
    res.send "<script>window.location.href='#{href}'</script>"

# 取OAuth的结果
wechat.result = (req, res) ->
    authCode = req.query.auth_code || ''
    if !authCode
        return res.status(500).send
            code: '-1'
            msg : '微信授权失败...'

    # 获取用户信息
    wechat.getUserInfo authCode, (err, user) ->
        if err
            res.status(500).send
                code: '-1'
                msg : err
            return logger.error err
        req.session.user =
            sid   : user.userid
            name  : user.name
            avatar: user.avatar
        res.redirect '/'

# 注销登陆
wechat.logout = (req, res) ->
    req.session.user = {}
    res.redirect '/wechat/oauth'