config = require(__dirname + '/config')
model  = require(__dirname + '/model')

module.exports = action = {}

# 权限验证
action.auth = (req, res, next) ->
    if req.session.user?.sid then return next()
    res.status(401).send
        code: -2
        msg : '您需要登陆登陆才能访问'

# 检查数据
action.check = (domain, target) ->
    if domain is config.domain
        return false
    return true

# GET请求
action.get = (req, res) ->
    sid = req.session.user.sid
    model.list sid, (err, rows) ->
        if err then return res.status(500).send
            code: -1
            msg : '服务器错误，列表获取失败'
        res.send
            code: 0
            data:
                list: rows
                user: req.session.user

# POST 请求
action.post = (req, res) ->
    # 数据初始化
    sid    = req.session.user.sid
    id     = req.body.id
    mark   = req.body.mark
    domain = req.body.domain
    target = req.body.target

    # 判断数据是否异常
    if !action.check(domain, target)
        return res.status(403).send
            code: -1
            msg : '请不要恶意操作！'

    # 更新数据
    model.update sid, id, mark, domain, target, (err) ->
        if err then return res.status(500).send
            code: -1
            msg : '修改失败，数据发生冲突'
        res.send
            code: 0
            msg: '修改成功'

# PUT 请求
action.put = (req, res) ->
    # 数据初始化
    sid    = req.session.user.sid
    mark   = req.body.mark
    domain = req.body.domain
    target = req.body.target

    # 判断数据是否异常
    if !action.check(domain, target)
        return res.status(403).send
            code: -1
            msg : '请不要恶意操作！'

    # 添加数据
    model.add sid, mark, domain, target, (err) ->
        if err then return res.status(500).send
            code: -1
            msg : '添加失败，可能数据已存在'
        res.send
            code: 0
            data: '添加成功'

# DELETE 请求
action.delete = (req, res) ->
    sid    = req.session.user.sid
    id     = req.query.id
    domain = req.query.domain
    model.delete sid, id, domain, (err) ->
        if err then return res.status(500).send
            code: -1
            msg : '删除失败'
        res.send
            code: 0
            data: '删除成功'