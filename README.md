#### 项目状态

##### Master

[![Build Status](https://travis-ci.org/qious/simple-proxy.svg?branch=master)](https://travis-ci.org/qious/simple-proxy)


##### 特性

* 支持 HTTP 、HTTPS
* 支持 SSL 配置
* 支持 WEB界面管理

#### **依赖安装**

```bash
git submodule init
git submodule update
npm install
```

#### **线上运行**

```bash
cp server/config/default.js server/config/local.js
cp pm2.sample.json pm2.json
npm run start
```

#### **协作开发**

* 启动服务器

```bash
npm run dev
```

* 执行测试

```bash
npm run test                # 运行所有测试
npm run test -- -g network  # 只测试 network
npm run cover               # 测试覆盖率
```

* 代码风格/质量检查

```bash
npm run lint
```

#### **目录结构**

    .
    ├── client                // 前端
    └── server
        ├── api               // API路由
        ├── config            // 配置文件
        ├── cron              // 计划任务
        ├── lib               // 通用函数
        ├── middleware        // 中间件
        ├── model             // 数据模型
        ├── service           // 业务逻辑
        └── app.js            // 入口文件
        └── cron.js           // 计划任务入口文件

#### **关联项目**
* [simple-proxy-front](https://github.com/qious/simple-proxy-front) 提供前端页面展示
