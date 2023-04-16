## 前言

本篇文章简要介绍了 Node.js BFF 架构和实战，可以让你在日常开发中构建一个 Node.js 微服务开发基础架构。
本篇文章同时也收录在公众号《泡芙学前端》，持续更新前端学习知识

## 文章的主要内容

- BFF 架构演进
- BFF 实战

### 微服务

优点：将单体应用划分为更小的服务，每个服务可以独立运行并且可以使用不同的语言开发，这些服务可能放在不同的机器上，他们之间的通信协议使用 RPC，该协议比 HTTP 具有更低的延迟和更高的性能

缺点：

- 域名开销增加
- 内部服务器暴露在公网，有安全隐患
- 各个端有大量的个性化需求
  - 数据聚合 某些功能可能需要调用多个微服务进行组合
  - 数据裁剪 后端服务返回的数据可能需要过滤掉一些敏感数据
  - 数据适配 后端返回的数据可能需要针对不同端进行数据结构的适配，后端返回 XML ，但 前端需要 JSON
  - 数据鉴权 不同的客户端有不同的权限要求

### BFF

BFF 是 Backend for Frontend 的缩写，指的是专门为前端应用设计的后端服务 主要用来为各个端提供代理数据聚合、裁剪、适配和鉴权服务，方便各个端接入后端服务 BFF 可以把前端和微服务进行解耦，各自可以独立演进

![1](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/1.png)

### 网关

- API 网关是一种用于在应用程序和 API 之间提供安全访问的中间层
- API 网关还可以用于监控 API 调用，路由请求，以及在请求和响应之间添加附加功能（例如身份验
  证，缓存，数据转换，压缩、流量控制、限流熔断、防爬虫等）
- 网关和 BFF 可能合二为一

![2](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/2.png)

### 集群化

单点服务器可能会存在以下几个问题：

- 单点故障：单点服务器只有一台，如果这台服务器出现故障，整个系统都会停止工作，这会导
  致服务中断
- 计算能力有限：单点服务器的计算能力是有限的，无法应对大规模的计算需求
- 可扩展性差：单点服务器的扩展能力有限，如果想要提升计算能力，就必须改造或者替换现有
  的服务器
  这些问题可以通过采用服务器集群的方式来解决

![3](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/3.png)

### RPC

`RPC（Remote Procedure Call）` 是远程过程调用的缩写，是一种通信协议，允许程序在不同的 计算机上相互调用远程过程，就像调用本地过程一样

### sofa-rpc-node 框架

`sofa-rpc-node` 是(阿里开源)基于 Node.js 的一个 RPC 框架，支持多种协议

### Protocol Buffers

`Protocol Buffers （简称 protobuf）`是 Google 开发的一种数据序列化格式，可以将结构化数 据序列化成二进制格式，并能够跨语言使用

### Zookeeper

ZooKeeper 是一个分布式协调服务，提供了一些简单的分布式服务，如配置维护、名字服务、组服务等。它可以用于管理分布式系统中的数据

### 缓存

一般会使用多级缓存，本地做一层 LRU 缓存，再做一层远程服务器的 Redis 缓存。这些缓存层的优先级通常是依次递减的，即最快的缓存层位于最顶层，最慢的缓存层位于最底层。越上层的缓存缓存时间一般越短

### 消息队列

在 BFF 中使用消息队列（message queue）有几个原因：

- 大并发：消息队列可以帮助应对大并发的请求，BFF 可以将请求写入消息队列，然后后端服务 可以从消息队列中读取请求并处理
- 解耦：消息队列可以帮助解耦 BFF 和后端服务，BFF 不需要关心后端服务的具体实现，只需 要将请求写入消息队列，后端服务负责从消息队列中读取请求并处理
- 异步：消息队列可以帮助实现异步调用，BFF 可以将请求写入消息队列，然后立即返回响应给 前端应用，后端服务在后台处理请求
- 流量削峰：消息队列可以帮助流量削峰，BFF 可以将请求写入消息队列，然后后端服务可以在 合适的时候处理请求，从而缓解瞬时高峰流量带来的压力

### RabbitMQ

RabbitMQ 是一个消息代理，它可以用来在消息生产者和消息消费者之间传递消息 RabbitMQ 的工作流程如下：

- 消息生产者将消息发送到 RabbitMQ 服务器
- RabbitMQ 服务器将消息保存到队列中
- 消息消费者从队列中读取消息
- 当消息消费者处理完消息后 RabbitMQ 服务器将消息删除

## 实战案例

### Docker 容器安装

先在本地安装好 Docker(怎么安装就不介绍了，我之前写的文章里也有)，这里使用 Windows 系统，先在命令行执行下面命令，安装好我们需要使用到的镜像

```
docker pull mysql
docker pull redis
docker pull zookeeper
docker pull rabbitmq
```

然后再在命令行启动相关的镜像

```
# mysql 的密码初始化为 123456
docker run -d --hostname localhost -e MYSQL_ROOT_PASSWORD=123456 --name mysql -p 3306:3306 mysql
docker run -d --hostname localhost --name redis -p 6379:6379 redis
docker run -d --hostname localhost --name zookeeper -p 2181:2181 zookeeper
docker run -d --hostname localhost --name myrabbit -p 5672:5672 rabbitmq
```

- -d 后台进程运行
- hostname 主机名称
- name 容器名称
- -p port:port 本地端口:容器端口

执行完上面命令后执行 `docker ps` 看看我们是否所有都启动成功了

这里我们是做最简单的一个学习目的，不作为生产使用，所以怎么操作简单就怎么来

数据库工具我们使用 `Navicat Premium`，我们先在 Navicat 中连接上 Docker 中启动的数据库，然后创建一个 BFF 数据库，接下来在 Navicat 中执行这个命令创建一个简单的 user 表用于测试

```sql
create table user (id varchar(64) comment '编号',username varchar(20) comment '用户名',phone varchar(15) comment '手机号码') comment '用户表'
```

### 创建项目

最终的项目文件夹目录如下：

```
├── bff                 用于和前端交互的 bff 胶水层
│   ├── index.js
│   ├── middleware
│   │   ├── cache.js
│   │   ├── mq.js
│   │   └── rpc.js
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── store
│   │   └── index.js
│   └── utils
│       └── log.js
├── user                用户相关的微服务函数
│   ├── client.js
│   ├── index.js
│   ├── package.json
│   └── pnpm-lock.yaml
└── write-logger        写入日志的服务
    ├── index.js
    ├── logger.txt
    ├── package.json
    └── pnpm-lock.yaml
```

我们先使用 node 去创建一个简单的微服务函数，创建一个空目录 bff，然后再在里面创建一个空目录 user，用于编写 user 相关的微服务函数，然后运行 `npm init -y` ，增加下面相关的依赖之后运行 `pnpm install` (可以使用别的包管理器)

```js
{
  "name": "user",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "koa-logger": "^3.2.1",
    "koa-router": "^12.0.0",
    "mysql2": "^2.3.3",
    "sofa-rpc-node": "^2.8.0",
    "uuid": "^9.0.0"
  }
}
```

在 user 中再新建一个 index.js 文件，写入如下代码，主要是在函数中连接数据库，然后创建 Zookeeper 注册中心，创建微服务服务器，将其中的函数注册到 Zookeeper 中，用于给外部进行调用，我们这里主要注册两个函数

- 创建用户
- 获取用户信息

```js
const {
  // 创建 rpc 服务器
  server: { RpcServer },
  // 创建注册中心，维护服务的注册信息，帮助节点和客户端找到对方
  registry: { ZookeeperRegistry },
} = require('sofa-rpc-node');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const logger = console;

let connection;

// 创建一个注册中心，用于注册微服务
const registry = new ZookeeperRegistry({
  // 记录日志
  logger,
  // zookeeper 的地址
  address: 'localhost:2181',
});

// 创建 rpc 服务器的实例
// 客户端连接 rpc 服务器的时候可以通过 zookeeper， 也可以直连 rpc 服务器
const server = new RpcServer({
  logger,
  registry,
  port: 10000,
});

(async function () {
  connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'bff',
  });

  // 添加服务接口
  server.addService(
    {
      // 约定格式为域名反转+领域模型的名称
      interfaceName: 'com.puffmeow.user',
    },
    {
      async createUser(username) {
        const sql = `INSERT INTO user(id,username,phone) VALUES('${uuidv4()}','${username}',185);`;
        const rows = await connection.execute(sql);
        return {
          message: '创建成功',
          data: rows,
          success: true,
        };
      },
      async getUserInfo(username) {
        const sql = `SELECT id,username,phone from user WHERE username='${username}' limit 1`;
        const [rows] = await connection.execute(sql);

        return {
          message: '查询成功',
          data: rows[0],
          success: true,
        };
      },
    }
  );

  // 启动 rpc 服务
  await server.start();
  // 把启动好的 rpc 服务器注册到 zookeeper 中
  await server.publish();
  console.log('微服务启动');
})();
```

然后我们微服务代码写好之后，再去写一个用于记录日志的服务，里面会使用到 RabbitMQ 消息队列，写入日志属于文件 io 操作，一般速度会比较慢，所以我们可以放到消息队列中让其慢慢的去进行读写

在 bff 目录下创建一个 write-logger 目录，然后 `npm init -y`， 写入如下依赖，然后运行 `pnpm install`

```json
{
  "name": "write-logger",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "amqplib": "^0.10.3",
    "fs-extra": "^11.1.0"
  }
}
```

安装好依赖后，write-logger 目录下创建一个 index.js 文件，写入如下代码

```js
// 用于连接 RabbitMQ 服务器
const amqp = require('amqplib');

const fs = require('fs-extra');

(async function () {
  // 连接 MQ 服务器
  const mqClient = await amqp.connect('amqp://localhost');
  // 创建一个通道
  const logger = await mqClient.createChannel();
  // 创建一个名称为 logger 的队列，如果已经存在了，不会重复创建
  await logger.assertQueue('logger');
  // 消费队列里的消息
  logger.consume('logger', async (event) => {
    // 往本地写入日志文件，到时候 bff 端会以 Buffer 二进制的形式发送数据过来
    await fs.appendFile('./logger.txt', event.content.toString() + '\n');
  });
})();
```

上面的两个服务写好之后，我们就可以正式写我们的 Node 胶水 BFF 层服务器了，一样的步骤，先在 bff 目录下创建一个 bff 目录，然后 `npm init -y`，写入如下的依赖后运行 `pnpm install`

```json
{
  "name": "bff",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "amqplib": "^0.10.3",
    "fs-extra": "^11.1.0",
    "koa": "^2.14.1",
    "koa-logger": "^3.2.1",
    "koa-router": "^12.0.0",
    "sofa-rpc-node": "^2.8.0"
  }
}
```

在 bff 下的 index.js 文件中，写入如下代码，大概分为这几步：

- 创建一个 koa http 服务器
- 创建 rpc 远程调用中间件
- 创建缓存中间件
- 创建 RabbitMQ 队列中间件
- 创建 logger 工具
- 编写两个 http 接口供前端调用

一个最简单的 Koa 服务器，嗯 ，就这么几行代码就够了，接下来我们创建几个中间件

```js
const Koa = require('koa');
const router = require('koa-router')();

const app = new Koa();

app.use(router.routes()).use(router.allowedMethods());

router.get('/', async (ctx) => {
  ctx.body = 'Hello world';
});

app.listen(3000, () => {
  console.log('启动成功');
});
```

#### rpc 中间件

在 `bff/middleware/rpc.js` 路径下，写入如下代码：

```js
const {
  // 创建 rpc 服务器
  client: { RpcClient },
  // 创建注册中心，维护服务的注册信息，帮助节点和客户端找到对方
  registry: { ZookeeperRegistry },
} = require('sofa-rpc-node');
const logger = console;

const rpcMiddleware = (options = {}) => {
  return async function (ctx, next) {
    // 创建一个注册中心，用于注册微服务
    const registry = new ZookeeperRegistry({
      // 记录日志
      logger,
      // zookeeper 的地址
      address: 'localhost:2181',
    });

    const client = new RpcClient({
      logger,
      registry,
    });

    const interfaceNames = options.interfaceNames || [];
    const rpcConsumers = {};

    for (let i = 0; i < interfaceNames.length; i++) {
      const interfaceName = interfaceNames[i];

      // 创建 RPC 服务器的消费者,通过消费者调用 rpc 接口
      const consumer = client.createConsumer({ interfaceName });
      // 等待服务就绪
      await consumer.ready();

      rpcConsumers[interfaceName.split('.').pop()] = consumer;
    }

    ctx.rpcConsumers = rpcConsumers;
    await next();
  };
};

module.exports = rpcMiddleware;
```

#### 缓存中间件

我们先在 `bff/store/index.js` 中写入这些代码，这里主要是创建了 3 个类

- CacheStore：管理 Store 容器的类，优先使用 LRU 算法调用本地内存缓存，命中不到再去调用 Redis 缓存
- MemoryStore：本地内存 Store
- RedisStore：远程 Redis 服务器 Store

```js
const LRUCache = require('lru-cache');
const Redis = require('ioredis');

// 一般越上层的缓存过期时间就越短
class CacheStore {
  constructor() {
    this.stores = [];
  }

  add(store) {
    this.stores.push(store);
    return this;
  }

  async set(key, value) {
    for (const store of this.stores) {
      await store.set(key, value);
    }
  }

  async get(key) {
    for (const store of this.stores) {
      const value = await store.get(key);
      if (value !== undefined) {
        return value;
      }
    }
  }
}

class MemoryStore {
  constructor() {
    this.cache = new LRUCache({
      max: 100,
      // 一分钟过期
      ttl: 1000 * 60,
    });
  }

  async set(key, value) {
    this.cache.set(key, value);
  }

  async get(key) {
    return this.cache.get(key);
  }
}

class RedisStore {
  constructor(
    options = {
      host: 'localhost',
      port: '6379',
    }
  ) {
    this.client = new Redis(options);
  }

  async set(key, value) {
    this.client.set(key, JSON.stringify(value));
  }

  async get(key) {
    const val = await this.client.get(key);
    return val ? JSON.parse(val) : undefined;
  }
}

module.exports = {
  CacheStore,
  MemoryStore,
  RedisStore,
};
```

然后在 `bff/middleware/cache.js` 中写入缓存中间件的代码

```js
const { RedisStore, CacheStore, MemoryStore } = require('../store');

const cacheMiddleware = (options) => {
  return async function (ctx, next) {
    // 创建一个缓存实例
    const cacheStore = new CacheStore();

    // 添加一些缓存层
    cacheStore.add(new MemoryStore());
    cacheStore.add(new RedisStore(options));

    ctx.cache = cacheStore;
    await next();
  };
};

module.exports = cacheMiddleware;
```

#### RabbitMQ 中间件

`bff/middleware/mq.js` 中写入如下代码，用于连接 RabbitMQ 消息队列服务器

```js
// RabbitMQ
const amqp = require('amqplib');

const MQMiddleware = (
  options = {
    url: 'amqp://localhost',
  }
) => {
  return async function (ctx, next) {
    // 连接 MQ 服务器
    const mqClient = await amqp.connect(options.url);
    // 创建一个通道
    const logger = await mqClient.createChannel();
    // 创建一个名称为 logger 的队列，如果已经存在了，不会重复创建
    await logger.assertQueue('logger');
    // 将其挂载到 ctx.channels 中，其它地方就能进行调用了
    ctx.channels = {
      logger,
    };

    await next();
  };
};

module.exports = MQMiddleware;
```

#### log 日志工具

在 `bff/utils/log` 路径下，封装日志记录函数用于发送消息到 RabbitMQ 消息队列供其它服务消费来写入日志

```js
module.exports = log = (ctx, data) => {
  // 把用户信息写入文件进行持久化，通过 Buffer 二进制发送
  ctx.channels.logger.sendToQueue(
    'logger',
    Buffer.from(
      JSON.stringify({
        method: ctx.method,
        path: ctx.path,
        ...data,
      })
    )
  );
};
```

#### 编写完整接口

`bff/index.js` 补充完整的代码：

```js
const Koa = require('koa');
const router = require('koa-router')();
const logger = require('koa-logger');
const cacheMiddleware = require('./middleware/cache');
const MQMiddleware = require('./middleware/mq');
const rpcMiddleware = require('./middleware/rpc');
const log = require('./utils/log');

const app = new Koa();

app.use(logger());
app.use(
  rpcMiddleware({
    interfaceNames: ['com.puffmeow.user'],
  })
);
app.use(cacheMiddleware());
app.use(MQMiddleware());

app.use(router.routes()).use(router.allowedMethods());

router.get('/getUserInfo', async (ctx) => {
  const username = ctx.query.username;

  const cacheKey = `${ctx.method}-${ctx.path}-${username}`;
  let cacheData = await ctx.cache.get(cacheKey);

  // 把用户信息写入文件进行持久化，通过 Buffer 二进制发送
  log(ctx, {
    username,
  });

  if (cacheData) {
    ctx.body = cacheData;
    return;
  }

  const {
    rpcConsumers: { user },
  } = ctx;

  const userInfo = await user.invoke('getUserInfo', [username]);

  cacheData = {
    userInfo,
  };

  await ctx.cache.set(cacheKey, cacheData);

  ctx.body = cacheData;
});

// 插入一条 user 数据
router.get('/createUser', async (ctx) => {
  const username = ctx.query.username;
  log(ctx, {
    username,
  });

  const {
    rpcConsumers: { user },
  } = ctx;
  const res = await user.invoke('createUser', [username]);

  ctx.body = res;
});

app.listen(3000, () => {
  console.log('启动成功');
});
```

然后我们把上面编写的三个服务通过命令行先跑起来，在各个目录下运行 `npm run dev` 即可

最后在服务器中我们就能通过访问下面的 url 来进行相应的测试了

```
# 创建一个名为 test 的用户
http://localhost:3000/createUser?username=test

# 查找名为 test 的用户
http://localhost:3000/getUserInfo?username=test
```

## BFF 的问题

- 复杂性增加：添加 BFF 层会增加系统的复杂性，因为它需要在后端 API 和前端应用程序之间处理请 求和响应
- 性能问题：如果 BFF 层的实现不当，可能会导致性能问题，因为它需要在后端 API 和前端应用程序 之间传输大量数据
- 安全风险：如果 BFF 层未得到正确保护，可能会导致安全风险，因为它可能会暴露敏感数据 维护成本：BFF 层需要维护和更新，这会增加维护成本
- 测试复杂性：由于 BFF 层需要在后端 API 和前端应用程序之间进行测试，因此测试可能会变得更加 复杂 运维问题 要求有强大的日志、服务器监控、性能监控、负载均衡、备份冗灾、监控报警和弹性伸缩 扩容等

但是上述的问题可以使用 Serverless 来进行解决，特别是对于运维能力不太强的前端来说，如果要开发一个完整的全栈应用，使用 Serverless 是比较好的选择，小程序的云开发其实就是 Serverless，阿里云同时也提供了 Serverless 按量或者按月计费的服务。

## 最后

本篇文章也同时收录在公众号《泡芙学前端》，持续更新前端学习内容~
