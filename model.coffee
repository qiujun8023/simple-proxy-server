schedule = require('node-schedule')
config   = require(__dirname + '/config')

logger   = config.logger

module.exports = model = {}

# 缓存数据
model._cache = {}
model.cache  = (domain, item) ->
    if arguments.length < 2
        logger.debug "获取缓存数据字段 #{domain} 的值"
        return model._cache[domain]
    model._cache[domain] = item
    logger.debug "更新缓存数据字段 #{domain} 的值为", item

# 更新访问次数
model.updateCount = (callback)->
    callback ||= ->

    # 构造SQL参数
    flag = true
    [sql, values] = ['', []]
    for domain, item of model._cache
        flag = false
        if !item then continue
        sql += 'UPDATE `proxy` SET `count` = ? WHERE `domain` = ?;'
        values.push item.count, domain

    # 执行SQL
    if flag then return callback null
    config.mysqlQuery
        sql   : sql
        values: values
    , callback
    logger.debug "已更新访问次数到MySQL"

# 定时更新访问次数
model.schedule = ->
    schedule.scheduleJob '*/3 * * * *', ->
        logger.debug '执行定时任务，更新访问次数'
        model.updateCount (err) ->
            if err then logger.debug '更新访问次数失败：', err

# 添加记录
model.add    = (sid, mark, domain, target, callback) ->
    callback ||= ->
    sql = 'INSERT INTO `proxy` (`sid`, `mark`, `domain`, `target`)
           VALUES (?, ?, ?, ?)'
    config.mysqlQuery
        sql   : sql
        values: [sid, mark, domain, target]
    , (err) ->
        if err then return callback err
        logger.debug "添加域名 #{domain} 到 #{target} 的记录"
        model.cache domain,
            value: target
            count: 0
        callback null

# 删除一条记录
model.delete = (sid, id, domain, callback) ->
    callback ||= ->
    sql = "DELETE FROM `proxy` WHERE `id` = ? AND
           (`sid` = ? OR ? IN (SELECT `sid` FROM `admin`)) LIMIT 1"
    config.mysqlQuery
        sql   : sql
        values: [id, sid, sid]
    , (err) ->
        if err then return callback err
        logger.debug "删除域名 #{domain} 的代理记录"
        model.cache domain, undefined
        callback null

# 更新代理
model.update = (sid, id, mark, domain, target, callback) ->
    callback ||= ->
    sql = "UPDATE `proxy` SET `mark` = ?, `domain` = ?, `target` = ?
           WHERE `id` = ? AND
           (`sid` = ? OR ? IN (SELECT `sid` FROM `admin`)) LIMIT 1"
    config.mysqlQuery
        sql   : sql
        values: [mark, domain, target, id, sid, sid]
    , (err) ->
        if err then return callback err
        logger.debug "更新域名 #{domain} 的代理目标为 #{target}"
        model.cache domain,
            value: target
            count: 0
        callback null

# 获取列表
model.list   = (sid, callback) ->
    callback ||= ->
    sql = "SELECT `p`.`id`, `p`.`sid`, `p`.`mark`, `p`.`domain`,
            `p`.`target`, `p`.`count`, `p`.`time` FROM `proxy` `p`,
           (SELECT count(*) `count` FROM `admin` WHERE `sid` = ?) `a`
           WHERE `p`.`sid` LIKE IF(`a`.`count` = 0, ?, '%')"
    config.mysqlQuery
        sql   : sql
        values: [sid, sid]
    , callback
    logger.debug "获取用户 #{sid} 的管理列表"

# 数据初始化
model.init   = ->
    logger.debug '数据初始化中...'
    model.list 'admin', (err, rows) ->
        if err then throw err
        for row in rows
            model.cache row.domain,
                value: row.target
                count: row.count
