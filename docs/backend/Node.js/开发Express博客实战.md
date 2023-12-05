# 【Node.js实战系列】Express 从零搭建博客系统(一)

## 前言

> 哈喽，大家好，这里是胖芙，咱这系列的文章主打的就是一个通俗易懂。这个系列的文章会从零开始教你怎么使用 Express.js 去搭建一个能用的博客系统，是真的从零，手把手的那种！！！让你打通 JS 前后端任督二脉！
>
> 本系列文章也会收录在公众号《泡芙学前端》中，持续更新中... 欢迎关注

首先要知道我们现在要做个怎样的系统，比如博客能干嘛？

那它的核心功能肯定是对于文章的增删改查嘛，所以我们就有了以下的几个核心接口：

- 发表博客
- 分页查看博客列表
- 根据id查看博客详情
- 根据id删除博客(软删除)
- 根据id修改博客内容
- 上传文件（比如博客内的图片），前期我们先把图片存本地，后面可以改成上传到 OSS

好了，这几个接口搞完了其实博客系统的雏形就已经有了。

但是哎，好像还不太够，还缺点啥？所以接下来我们继续给博客添加功能，比如用户登录注册功能：

- 用户注册
- 用户登录

嗯，开始有点内味了，到这里一个基本的博客系统就其实已经可以自己用起来了。

接下来我们就继续锦上添花，比如我们为了让博客能分类，来添加一个标签系统，可以给博客打上分类的标签，比如 JavaScript、Node.js、React 等标签

- 新增标签
- 查询标签
- 删除标签(软删除)

到这里为止一个博客的雏形就已经有了，后续可以基于这个雏形来添加更多的功能，比如接入 Redis 缓存进行优化等，不过那都是后话了，我们这里就先把一个雏形从零开始搭建完成。

我们本系列教程只写后端，大家如果有兴趣的话可以自己写一下前端，或者如果后续反馈好，我也可以把前端部分给补上。

废话不多说，直接开始吧。首先我们先来完成基本环境的一个搭建工作哈

## 1.搭建初始环境

- 找到一个地方创建目录，比如 express-blog

- 进入目录，控制台运行 `npm init -y`

- 修改 package.json 中的 scripts 字段为下面代码，作为启动入口，推荐安装 nodemon 这个包，当文件变更时它可以自动重启服务

  - `npm i nodemon -g` 安装到全局

  - ```json
    "scripts": {
      "start": "nodemon app.js"
    },
    ```

- 安装依赖：`npm install express sequelize mysql2 body-parser cors bcrypt jsonwebtoken multer`
  - express: 我们要用的服务端框架
  - sequelize: 操作数据库的 orm
  - mysql2: 数据库驱动
  - body-parser: 用来解析 request body 的内容
  - cors: 解决跨域
  - bcrypt: 密码加密和解密
  - jsonwebtoken: 登录时生成 token 下发
  - multer: 用于上传文件

上面搞完后，我们就得到了这样的一个 package.json 文件

```json
{
  "name": "expree-blog",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^5.1.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "multer": "1.4.5-lts.1",
    "mysql2": "^3.3.3",
    "sequelize": "^6.31.1"
  }
}
```

到这里我们就完成了第一步工作，接下来我们就要创建目录结构了，最终项目完成时的目录结构长这个样子

```xml
expree-blog                   // 根目录
├── app.js                    // 项目主入口
├── config                    // 数据库配置
│   └── database.js
├── controllers               // 控制器，写逻辑的地方
│   ├── authController.js     // 登录注册控制器
│   ├── blogController.js     // 博客控制器
│   ├── fileController.js     // 文件控制器
│   └── tagController.js      // 标签控制器
├── middleware                // 中间件
│   ├── authMiddleware.js     // 鉴权中间件
│   └── fileMiddleware.js     // 文件处理中间件
├── models                    // 数据库模型
│   ├── Blog.js
│   ├── Tag.js
│   └── User.js
├── package.json
├── routes                    // 路由
│   ├── auth.js
│   ├── blogs.js
│   ├── file.js
│   └── tags.js
└── tempFiles                 // 存储上传的文件
```

## 2.数据库配置

这里可以启动自己的本地 mysql 数据库，然后填入对应信息即可，不知道怎么安装 mysql 的可以网上查下相关教程，可以使用 docker 安装，或者直接去官网下载安装包然后装到本地。我自己的话是用的 Docker

```js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  // 数据库名称
  "your_database_name",
  // 数据库用户名
  "your_username",
  // 数据库密码
  "your_password",
  {
    // 如果是远程数据库，可以填写 ip 地址
    host: "localhost",
    dialect: "mysql",
  }
);

module.exports = sequelize;
```

当数据库启动起来之后，改一下上面的参数即可

## 3.构建数据库模型

现在我们要在 `models/` 目录下创建下面这几个模型文件：

- `User.js`：用户模型
- `Blog.js`：博客模型
- `Tag.js`：标签模型

然后在各个模型中去定义相应的字段：

### 用户模型

```js
// models/User.js

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class User extends Model {}

User.init(
  {
    username: {
      comment: "用户名",
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      comment: "密码",
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      comment: "昵称",
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastOnlineTime: {
      comment: "最后登陆时间",
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

module.exports = User;
```

### 博客模型

```js
// models/Blog.js

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Tag = require("./Tag");

class Blog extends Model {}

Blog.init(
  {
    title: {
      comment: "标题",
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      comment: "博客内容",
      type: DataTypes.TEXT,
      allowNull: false,
    },
    coverImage: {
      comment: "封面图",
      type: DataTypes.STRING,
    },
    isDeleted: {
      comment: "是否已经删除",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Blog",
  }
);

// 一篇博客可以对应多个标签
// 一个标签也可以对应到多篇博客

// 博客与标签的关联关系
Blog.belongsToMany(Tag, {
  through: "Blog_Tag",
  as: "tags",
});

// 标签和博客的关联关系
Tag.belongsToMany(Blog, {
  through: "Blog_Tag",
  as: "blogs",
});

// 一篇博客只能属于一个用户
// 一个用户可以拥有多篇博客

// 博客与用户的关联关系
Blog.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Blog, { foreignKey: "userId", as: "user" });

module.exports = Blog;
```

### 标签模型

```js
// models/Tag.js

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
class Tag extends Model {}

Tag.init(
  {
    name: {
      comment: "标签名称",
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isDeleted: {
      comment: "是否已经删除",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Tag",
  }
);

module.exports = Tag;
```

## 4.初始化主入口

```js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");
const tagRoutes = require("./routes/tags");
const fileRoutes = require("./routes/file");
const sequelize = require("./config/database");

const app = express();

// 中间件
// 用来解析 post body x-www-form-urlencoded 格式数据
app.use(bodyParser.urlencoded({ extended: false }));
// 用来解析 post body json 格式数据
app.use(bodyParser.json());
// 处理跨域
app.use(cors());
// 提供静态文件访问
app.use("/tempFiles", express.static(path.join(__dirname, "tempFiles")));

// 路由
app.use("/auth", authRoutes);
app.use("/blogs", blogRoutes);
app.use("/tags", tagRoutes);
app.use("/upload", fileRoutes);

// 数据库同步
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

## 5. 初始化路由

这里我们采用 Restful 风格的路由

### 登录注册路由

```js
// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
```

### 博客路由

```js
// routes/blogs.js

const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// 创建博客
router.post('/create', blogController.createBlog);
// 查询博客列表
router.get('/query', blogController.getBlogList);
// 根据 id 查询博客详情
router.get('/query/:id', blogController.getBlogById);
// 根据 id 修改博客
router.patch('/update/:id', blogController.updateBlog);
// 根据 id 删除博客
router.delete('/delete/:id', blogController.deleteBlog);

module.exports = router;
```

### 标签路由

```js
// routes/tags.js

const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// 创建标签
router.post('/create', tagController.createTag);
// 查询所有标签
router.get('/query', tagController.getTags);
// 根据 id 删除标签
router.delete('/delete/:id', tagController.deleteTag);

module.exports = router;
```

### 文件路由

```js
// routes/file.js
const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

// 目前只有一个上传文件接口
router.post("/file", fileController.uploadFile);

module.exports = router;
```

## 6.初始化控制器

### 登录注册

```js
// 注册
async function register(req, res) {
  // todo
}

// 登录
async function login(req, res) {
  // todo
}

module.exports = { register, login };
```

### 博客

```js
async function createBlog(req, res) {
  // todo
}

async function getBlogList(req, res) {
  // todo
}

async function getBlogById(req, res) {
  // todo
}

async function updateBlog(req, res) {
  // todo
}

async function deleteBlog(req, res) {
  // todo
}

module.exports = {
  createBlog,
  getBlogList,
  getBlogById,
  updateBlog,
  deleteBlog,
};
```

### 标签

```js
async function createTag(req, res) {
  // todo
}

async function getTags(req, res) {
  // todo
}

async function updateTag(req, res) {
  // todo
}

async function deleteTag(req, res) {
  // todo
}

module.exports = { createTag, getTags, updateTag, deleteTag };
```

### 上传文件

```js
async function uploadFile(req, res) {
  // todo
}

module.exports = { uploadFile };
```

## 小结

以上就是关于 Express 从零搭建博客系统的初始化相关内容了~

下一篇文章我们将完成登录和注册功能~，来实现 token 的下发和校验功能

如果想要实时收到文章的更新，欢迎关注公众号《泡芙学前端》，同步更新文章中~

# 【Node.js实战】实现登录注册-Express 搭建博客(二)
## 前言

> 哈喽，大家好，这里是胖芙，咱这系列的文章主打的就是一个通俗易懂。这个系列的文章会从零开始教你怎么使用 Express.js 去搭建一个能用的博客系统，是真的从零，手把手的那种！！！让你打通 JS 前后端任督二脉！
>
> 本系列文章也会收录在公众号《泡芙学前端》中，持续更新中... 欢迎关注

书接上文 [【Node.js实战】Express 从零搭建博客系统(一)](https://juejin.cn/post/7240342069997715511)

上一篇文章中我们已经把项目结构搭建好了，这里就可以直接开始编写功能了。

那么本章节中我们就来实现登录和注册功能，接下来再让我们来看一眼用户模型

## 用户模型定义

主要包括用户名、密码、昵称、最后的登录时间

```js
// models/User.js

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class User extends Model {}

User.init(
  {
    username: {
      comment: "用户名",
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      comment: "密码",
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      comment: "昵称",
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastOnlineTime: {
      comment: "最后登陆时间",
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

module.exports = User;
```

定义好了字段之后我们就可以开始写接口了

## 定义接口

我们现在要实现两个接口：

*   localhost:3000/auth/login： 登录
*   localhost:3000/auth/register： 注册

```js
// 根目录/app.js
... 具体代码可以看上一章节的实现

// 路由
app.use("/auth", authRoutes);

...
```

## 定义路由

```js
// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 注册控制器
router.post('/register', authController.register);
// 登录控制器
router.post('/login', authController.login);

module.exports = router;
```

## 定义控制器

### 注册

接下来我们先来看注册功能，登录功能的本质其实就是把用户的注册信息存到数据库，但是存入数据库的时候需要对其输入的密码进行加密防止数据库信息泄露时用户信息遭到暴露。具体就下面这么几个步骤：

1.  检查用户名是否已存在
2.  对密码进行加密处理
3.  创建新用户，存入数据库
4.  返回信息

这时候我们需要用到 bcrypt 这个依赖，它是用来给密码进行散列加密的，然后在登录的时候我们还会需要它来进行解密

```js
// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");

async function register(req, res) {
  const { username, password, nickname } = req.body;

  try {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ msg: "Username already exists" });
    }

    // 对密码进行加密处理
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    await User.create({ username, password: hashedPassword, nickname });

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to register user" });
  }
}

module.exports = { register };
```

### 登录

登录的过程其实就是校验用户的账号密码是否能在数据库中匹配出来，同时要对密码进行解密匹配。流程是这样的：

1.  看用户是否存在
2.  看密码是否匹配
3.  更新最后的登录时间
4.  创建 token
5.  下发用户信息和 token

```js
async function login(req, res) {
  const { username, password } = req.body;

  try {
    // 检查用户名是否存在
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // 检查密码是否匹配
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // 更新用户的最后在线时间
    user.lastOnlineTime = new Date();
    await user.save();

    // 创建 token 访问令牌
    const token = jwt.sign({ userId: user.id }, "xxx-your-secret-key", {
      expiresIn: "24h",
    });

    // 返回包含令牌、账号名和用户名的响应
    res.json({ token, account: user.username, nickname: user.nickname, userId: user.id});
  } catch (error) {
    res.status(500).json({ msg: "Failed to log in" });
  }
}

module.exports = { register, login };
```

现在我们的两个登录注册接口都编写完成了，接下来就要启动数据库去做接口验证了

## 启动数据库

耶斯，到这里我们就写完了我们的第一个接口。接下来要做的事情就是把数据库和服务给启动起来。这里我们使用 Docker 来进行 Mysql 的启动。如果你电脑上没安装 Docker，[可以去它的官网安装一下](https://www.docker.com/)，安装好之后在控制台输入 `docker -v` 有响应说明安装成功了

    docker -v
    Docker version 20.10.13, build a224086

安装好 Docker 之后，然后我们来安装一下 Mysql 镜像。来输入下面这条命令：

    docker run -d -p 3306:3306 -v D:/docker-mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 --name mysql-container mysql:5.7

然后解释下这条命令的意思

*   拉取5.7版本的 Mysql 镜像

*   将容器内3306端口号映射到宿主机的3306端口

*   将容器内的数据挂载到我Windows电脑上的 D 盘 docker-mysql 目录中

*   初始化设置账号为 root ，密码为123456

*   容器名称设置为 mysql-container

接下来在控制台输入下面这条命令，查看所有容器列表，里面能看到我们的 mysql 容器就说明启动成功了，接下来就可以去连接数据库了

    docker ps

![image-20230608005823392](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ac98ddf80634256b8ce1040ac9bf260~tplv-k3u1fbpfcp-zoom-1.image)

后续如果想方便的管理容器，可以下载一个 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 工具，它也是跨平台的，可以去其官网下载

## 连接数据库

别忘了我们在上一章中还没连接数据库呢，接下来我们去填一下连接数据库的参数，填写完对应的信息后，我们就能把服务给启动起来了

```js
// config/database.js

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  // 定义库名
  "express-blog",
  // 账号
  "root",
  // 密码
  "123456",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

module.exports = sequelize;
```

到了这里之后，我们完成了前置条件：

*   定义数据模型

*   编写接口 localhost:3000/auth/register

*   启动数据库

然后我们现在可以通过 `npm run start` 把服务给启动起来了，然后发送个注册请求去试试看。

## 发送请求

这里推荐两个工具：

*   Postman：发送请求的软件，我这里用的是这个
*   Thunder Client：这个是 VSCode 插件，直接在插件商店里搜索就可以，使用起来也很方便，看个人喜好选择

然后可以看到下面我们成功发送了注册请求

![image-20230609214601529](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/364e7449bbb2471f9d43f451563d2cce~tplv-k3u1fbpfcp-zoom-1.image)

然后我们看下数据库，也看到已经存入了这条数据，说明这接口没问题了\~，接下来我们再去验证下登录接口，完成 token 的下发

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03e2099637e64b1e90b65fe2e5457517~tplv-k3u1fbpfcp-watermark.image?)

接下来我们进行登录接口的请求，可以看到其正确的返回了用户的账号名、昵称、token、用户ID，那说明这个接口也通过了，至于异常情况，大家可以自己试一试~~
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38bc8b01a4694c5d9c1a1b35ae0b406d~tplv-k3u1fbpfcp-watermark.image?)

## 小结

恭喜你，到这里就更进一步了\~ 这一章我们主要完成了登录和注册接口的编写、数据库接入、接口调试的工作，然后下一章中我们会去编写文件上传的接口以及为其加上 token 的鉴权\~ 

如果想要实时收到文章的更新，欢迎关注公众号《泡芙学前端》，同步更新文章中\~

# 【Node.js实战】文件上传-Express 搭建博客(三)

## 前言

>哈喽，大家好，这里是胖芙，咱这系列的文章主打的就是一个通俗易懂。这个系列的文章会从零开始教你怎么使用 Express.js 去搭建一个能用的博客系统，是真的从零，手把手的那种！！！让你打通 JS 前后端任督二脉！

书接上文 

- [【Node.js实战】Express 从零搭建博客系统(一)](https://juejin.cn/post/7240342069997715511)

- [【Node.js实战】实现登录注册-Express 搭建博客(二)](https://juejin.cn/post/7242676549735202874)

上一篇文章中我们完成了登录和注册功能，已经可以注册新用户并且在登陆的时候下发用户信息和请求凭证 token。

接下来我们这里要实现的就是文件上传和接口鉴权的功能；

文件上传：比如发表博客的时候我们可以上传一个封面图，这时候就需要有一个文件上传的接口，文件上传完成之后会返回一个文件存储的地址，获取这个文件的时候可以直接访问对应的地址即可。上传文件有两种存储方式，一种是存储在服务端本地，另一种是存储到 OSS，我们这里会把两种方式都实现一下。

接口鉴权：除了登录和注册的接口以外，其它所有的接口都需要进行鉴权校验，比如上传文件就必须携带 token，也就是需要先进行登录

废话不多说，我们先来实现文件上传功能，直接来吧~

## 定义路由和控制器

上传文件我们首先需要安装好 multer 这个依赖，在第一章的时候我们已经搞好了，那么接下来再看一下我们之前第一章中定义好了的路由和控制器。首先是入口文件定义好路由以及添加本地静态文件访问，根目录同时创建一个 tempFiles 目录用于存储上传的文件

```js
// 根目录/app.js

... 其它代码请查看第一章
const fileRoutes = require("./routes/file");

// 提供静态文件访问
app.use("/tempFiles", express.static(path.join(__dirname, "tempFiles")));

// 路由
app.use("/upload", fileRoutes);

... 其它代码请查看第一章
```

接下来定义文件上传路由

```js
// 根目录/routes/file.js
const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

// 目前只有一个上传文件接口
router.post("/file", fileController.uploadFile);

module.exports = router;
```

定义文件上传控制器

```js
// 根目录/controllers/fileController.js

async function uploadFile(req, res) {
  // todo
}

module.exports = { uploadFile };
```

## 定义文件上传中间件

中间件本质上就是一个处理函数，可以在请求之前做一些相关的操作， 当一个请求到达express 的服务器之后，可以连续调用多个中间件，从而对这次请求进行预处理。

中间件的种类：全局中间件、路由中间件、全局错误处理中间件、第三方中间件等

我们这里要定义的文件上传中间件则属于路由级别中间件，就是在上传文件的接口请求之前做一些预处理，其实就是请求的时候先获得文件上传的路径，然后再在文件上传控制器中把文件上传的路径给返回客户端。

### 上传到本地

首先来定义一个文件上传中间件

```js
// 根目录/middleware/fileMiddleware.js

const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 文件上传配置
const storage = multer.diskStorage({
  // 上传的目标地址，这里我们就上传到本地根目录的 tempFiles 目录
  destination: (req, file, cb) => {
    const tempFolderPath = path.join(__dirname, "../tempFiles");
    // 如果目录不存在则创建
    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }
    cb(null, tempFolderPath);
  },
  // 定义上传的文件名
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, filename);
  },
});

// 文件上传中间件
const upload = multer({ storage });
const uploadMiddleware = upload.single("file");

module.exports = uploadMiddleware
```

定义好了中间件之后我们怎么使用呢？

直接在上传文件的路由中添加就好了

```js
// 根目录/routes/file.js

const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
// 导入
const uploadMiddleware = require("../middleware/fileMiddleware");

// 添加文件上传处理中间件
router.post("/file", uploadMiddleware, fileController.uploadFile);

module.exports = router;
```

接下来我们再来完善一下文件上传控制器里的逻辑

```js
// 根目录/controllers/fileController.js

async function uploadFile(req, res) {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: "No file provided" });
  }

  // 返回图片地址
  res.json({ msg: "File uploaded successfully", filePath: file.path });
}

module.exports = { uploadFile };
```

有了中间件之后，我们上传文件控制器的逻辑就这么简单

接下来我们来做一下测试哈，在第二章中我们已经把项目启动起来了，如果不知道可以去看前面的章节

现在我们打开 Postman，然后选择 POST 接口 Body 中的 form-data，把 key 改成 file，然后选择一个本地的文件进行上传

![image-20230612223912464](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612223912464.png)

最后我们可以看到文件成功上传到服务器根目录的 tempFiles 目录下了，一般在实际开发中，我们不会把文件的绝对地址给返回，需要进行额外的处理，比如返回 服务器地址/tempFiles/文件名.png 这样的一个路径，如 localhost:3000/tempFiles/puff.png，这样用户直接访问这个地址就能够看到我们的图片了

![image-20230612223947717](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612223947717.png)

说完了本地上传的逻辑，接下来我们再看下如何把文件上传到阿里云 OSS 上

### 上传文件到 OSS

为什么要把文件上传到 OSS ？ 首先是降低我们自己的维护成本，第二是可以提高服务器的性能，第三是大厂商的服务更大程度上来说会比我们自己搭建的文件服务要稳定得多，成本也会相对比自己搭建服务要低

说完了 OSS 的优点，那么接下来我们就看下如何把文件上传到 OSS 上吧，这里我们使用阿里云的对象存储 OSS

首先要登录阿里云官网，然后找到对象存储 OSS，进入到管理控制台

![对象存储](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612224653443.png)

创建一个 Bucket

![image-20230612225027527](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612225027527.png)

按需填写信息即可

![image-20230612225104801](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612225104801.png)

然后此时把这个 EndPoint 节点信息的前半部分 oss-cn-hangzhou 先记录下来，它叫做 Region (地区)，一会需要用

![image-20230612225156165](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612225156165.png)

接下来我们就去拿一下我们的访问 AccessKey

![image-20230612225407444](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612225407444.png)

创建一个账户

![image-20230612225721480](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612225721480.png)

记得把 OpenAPI 调用访问勾选上

![image-20230612225831200](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612225831200.png)

最后我们就得到访问 OSS 的 key 和 secret 了，先记录下来，一会也需要用到

![image-20230612225935011](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612225935011.png)

接下来我们得授权这个子账号访问 OSS 的权限，接下来就可以进行 OSS 的访问了

![image-20230612232653482](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612232653482.png)

最后得到了 Bucket、 Region、AccessKey、AccessKey Secret 这 4 个信息之后，我们就可以编写代码了，通过 API 的方式进行调用将文件上传

#### OSS 上传代码编写

先安装一下依赖 `npm install multer-aliyun-oss`

然后添加一个 ossMiddleware.js 中间件文件到 `根目录/middleware` 文件夹下

```js
// 根目录/middleware/ossMiddleware.js

const multer = require("multer");
const MAO = require("multer-aliyun-oss");

const upload = multer({
  storage: MAO({
    config: {
      region: "oss-cn-hangzhou",
      accessKeyId: "刚刚申请的ID",
      accessKeySecret: "刚刚申请的密钥",
      bucket: "express-blog",
    },
  }),
  // oss 中存放文件的文件夹
  destination: "public/images",
});

const ossMiddleware = upload.single('file')

module.exports = ossMiddleware;
```

然后我们到路由中引入一下

```js
// 根目录/routes/file.js

const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
// const uploadMiddleware = require("../middleware/fileMiddleware");
const ossUploadMiddleware = require("../middleware/ossMiddleware");

// 修改为 ossUploadMiddleware
router.post("/file", ossUploadMiddleware, fileController.uploadFile);

module.exports = router;
```

最后还要修改一下控制器中的返回字段

```js
// 根目录/controllers/fileController.js

async function uploadFile(req, res) {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: "No file provided" });
  }

  // 把 file.path 改成 file.url
  res.json({ msg: "File uploaded successfully", filePath: file.url });
}

module.exports = { uploadFile };
```

好了，到这里上传文件到 OSS 就大功告成了~

让我们来 Postman 测试一下，可以看到成功的返回了 OSS 存储文件的路径~~

![image-20230612233211041](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612233211041.png)

不过由于刚刚我们把 Bucket 的访问权限改成了私有，所以目前这个 filePath URL 是访问不了的~，如果想要开放到所有人都可以访问，去控制台修改一下 Bucket 的权限为 `公共读` 即可，不过这时候就要注意一下流量了，因为 OSS 是要收钱的，不过并不贵~

好了，到这里我们的上传文件就大功告成了

接下来我们来看看如何给上传文件的接口增加鉴权，也就是说用户必须先进行登录才能进行访问这个接口

## 定义鉴权中间件

那么有了上传文件的接口之后，那肯定是需要携带登录凭证过来的，所以我们就添加一个鉴权的中间件用于给非登录和注册以外的接口都加上鉴权机制

```js
// 根目录/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

// 鉴权中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  // 从 Authorization 头部解析 token，可以使用 Axios 的拦截器全局携带上该值
  // token 一般前面都是带 Bearer 的，然后后面接一个空格，接下来才是我们自己定义的 token 内容
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 验证 token，这个 token 密钥需要和我们登录时定义的那个一一对应上才行
  jwt.verify(token, "xxx-your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // 将用户信息存储到请求对象中，方便后续处理
    req.user = user;

    // 需要调用一下 next 放行到下一个处理中间件
    next();
  });
}

module.exports = authMiddleware
```

## 鉴权中间件添加到全局

完整的定义可以去看看前面的章节哈，这里我们主要就看增加的 `app.use(authMiddleware)` 这一行代码

```js
... 其它导入的内容
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// 中间件
...
// 提供静态文件访问
...

// 路由
app.use("/auth", authRoutes);

// 除了登录和注册接口之外，其它所有的接口都会走鉴权中间件
app.use(authMiddleware);
app.use("/blogs", blogRoutes);
app.use("/tags", tagRoutes);
app.use("/upload", fileRoutes);

// 数据库同步
...
// 启动服务器
...
```

这时候我们可以试一下不携带 token 的情况上传文件，可以看到正确的返回了未授权

![image-20230612234502477](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612234502477.png)

然后我们这时候进行登录，拿到 token，再携带 token 来发送请求试试，把这个 token 给复制下来

![image-20230612234610076](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612234610076.png)

然后携带着 token 再发送一下请求，这一次可以发送成功了

![image-20230612234720918](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230612234720918.png)

好了，这一章的内容到这里就基本结束了~~

## 小结

这一章中我们完成的内容有：

- 上传文件到本地
- 上传文件到OSS
- 完成接口鉴权

下次遇到这样类似的场景再也不怕了~

好了，下一章节我们就要进入到 tag 和 blog 两套接口的实现，也是该系列的最后一章

> 想要及时收到推送，欢迎关注公众号《泡芙学前端》，同步更新文章中...

# 【Node.js实战】博客路由编写-Express (终章)

## 前言

>哈喽，大家好，这里是胖芙，这个系列的文章会从零开始教你怎么使用 Express.js 去搭建一个能用的博客系统，手把手的那种！！！让你打通 JS 前后端任督二脉！
>

来来来，继续书接上文 

- [【Node.js实战】Express 从零搭建博客系统(一)](https://juejin.cn/post/7240342069997715511)
- [【Node.js实战】实现登录注册-Express 搭建博客(二)](https://juejin.cn/post/7242676549735202874)
- [【Node.js实战】文件上传-Express 搭建博客(三)](https://juejin.cn/post/7244098228248592445)

上一篇文章中我们完成了上传文件到本地、上传文件到阿里云 OSS、还有接口的 token 鉴权服务

那么这里也是本系列的最后一章，本章我们主要就来完成下列的接口

---
标签管理：

- 创建标签
- 查询所有标签
- 删除标签

---
博客管理:

- 创建博客
- 分页获取博客列表
- 根据博客 id 获取博客的详情
- 根据博客的 id 更新博客内容
- 根据标签的 id 查找所有关联了该 id 的博客
- 删除博客

---

## 标签逻辑编写

首先先来定义一下路由

```js
// routes/tags.js

const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// 创建标签
router.post('/create', tagController.createTag);
// 查询所有标签
router.get('/query', tagController.getTags);
// 根据 id 删除标签
router.delete('/delete/:id', tagController.deleteTag);

module.exports = router;
```

路由编写完成后开始进入控制器中编写逻辑

现在让我们先进入到 `根目录/controllers/tagController.js` 这个文件中

首先导入 Tag 模型

```js
const Tag = require("../models/Tag");
```

### 创建标签

```js
async function createTag(req, res) {
  try {
    const { name } = req.body;
    const oldTag = await Tag.findOne({
      where: {
        name,
      }
    });

    // 之前创建过这个标签
    if (oldTag) {
      // 标签没删除
      if (!oldTag.isDeleted) {
        return res.json({ msg: "标签已存在" });
      }

      // 标签如果已经删除了则直接将其恢复并更新创建时间
      oldTag.isDeleted = false;
      const newDate = +new Date();
      oldTag.createdAt = newDate;
      oldTag.updatedAt = newDate;

      await oldTag.save();
      return res.json(oldTag);
    }

    // 之前没创建过则直接创建
    const newTag = await Tag.create({ name });
    res.json(newTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 查询标签

这里时一次性查询所有的标签回来，没做分页，如果需要可以自己加下分页逻辑

```js
async function getTags(req, res) {
  try {
    const tags = await Tag.findAll({
      where: { isDeleted: false },
      // 从返回结果中移除 isDeleted 字段
      attributes: { exclude: ["isDeleted"] },
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 删除标签

这里的删除都是软删除，不会删除数据库中的数据，只是把 isDeleted 置为 true

```js
async function deleteTag(req, res) {
  try {
    const { id } = req.params;
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }
    tag.isDeleted = true;
    await tag.save();
    res.json({ status: "OK" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 测试接口

上面的逻辑编写完成后，我们使用 Postman 测试一下。在测试之前别忘了先进行登录，我们上一章中给所有的主逻辑接口都加上了鉴权校验。具体的逻辑在上一章我们也提到过。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef8149420c644132abdfe7154f11c692~tplv-k3u1fbpfcp-watermark.image?)

然后在调用后续我们所有编写的接口之前都要在这里加上登录获得的 token


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4fc7b193d14406a87aaa406f42f4b97~tplv-k3u1fbpfcp-watermark.image?)

如果是在前端中调用，可以在 axios 拦截器中统一给请求头带上该 token

```js
import axios from 'axios';

axios.interceptors.request.use(
  config => {
    if (localStorage.token) {
      config.headers.Authorization = 'Bearer ' + '登录获得的 token, 一般存在 localStorage.token 字段中';
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
```

#### 创建新标签
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0a9b9e71eeff43cc940262351cf26c66~tplv-k3u1fbpfcp-watermark.image?)

此时可以看到数据库中已经插入了该字段

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11592580cb754d76a37d1c6c2a63dae8~tplv-k3u1fbpfcp-watermark.image?)

如果这时候再点击一次重复创建就会返回 "标签已存在"

#### 查询所有标签

此时我们去调用查询接口，可以看到刚刚创建的那一条数据返回了

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92c0a7907f8b410eb20a542522035221~tplv-k3u1fbpfcp-watermark.image?)

#### 删除标签

我们把刚刚创建的那个标签的 id 20 传到删除接口中，删除成功后会返回 OK

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27ffdaf270c4445ea91909c3e2286c5b~tplv-k3u1fbpfcp-watermark.image?)

这时候我们再去查询一下标签看到返回了空数组，说明已经删除成功了

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0305d1a917ea4af89875a979ede7359b~tplv-k3u1fbpfcp-watermark.image?)

标签基本的主逻辑到这里就已经编写完成了~ 好啦，接下来我们就来看下博客逻辑的部分

## 博客逻辑编写

博客的逻辑分为增删改查四部分

首先先来定义好路由

```js
// routes/blogs.js

const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

// 创建博客
router.post("/create", blogController.createBlog);
// 查询博客列表
router.get("/query", blogController.getBlogList);
// 根据 id 查询博客详情
router.get("/query/:id", blogController.getBlogById);
// 根据 id 修改博客
router.patch("/update/:id", blogController.updateBlog);
// 根据 id 删除博客
router.delete("/delete/:id", blogController.deleteBlog);
// 根据标签id查找关联了该标签的博客
router.get("/queryByTag/:tagId", blogController.queryByTag);

module.exports = router;
```

编写完路由后，进入到博客控制器文件中 `根目录/controllers/blogController.js`

首先在文件开头导入这三个模型，一会需要用
```js
const Blog = require("../models/Blog");
const Tag = require("../models/Tag");
const User = require("../models/User");
```

当你在下面的代码中看到 attributes.include/exclude 时，只需要知道它们是用来处理返回结果中的字段的即可，比如返回结果中需要包含数据库中的某个字段或移除某个字段，through.attributes 则是用来控制关联模型中的字段的

### 创建博客
```js
async function createBlog(req, res) {
  try {
    const { title, content, coverImage, tags } = req.body;

    // 查询标签是否存在
    const existingTags = await Tag.findAll({
      where: { name: tags },
    });

    if (existingTags.length === 0) {
      return res.status(404).json({ error: "Tags not found" });
    }

    // 创建博客记录
    const newBlog = await Blog.create({
      title,
      content,
      coverImage,
      // 在鉴权中间件中我们挂载了用户信息在 req 中
      userId: req.user.userId,
      isDeleted: false,
    });

    // 关联标签和博客
    await newBlog.setTags(existingTags);

    // 返回创建的博客记录
    res.json(newBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 分页获取博客列表

这里我们加了分页的逻辑

```js
async function getBlogList(req, res) {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const _page = parseInt(page);
    const _pageSize = parseInt(pageSize);

    // 查询所有博客并返回数量
    const blogs = await Blog.findAndCountAll({
      offset: (_page - 1) * _pageSize,
      limit: _pageSize,
      where: { isDeleted: false },
      distinct: true,
      attributes: {
        exclude: ["isDeleted"],
      },
      include: [
        {
          model: Tag,
          as: "tags",
          attributes: {
            exclude: ["isDeleted", "createdAt", "updatedAt"],
          },
          through: {
            attributes: [],
          },
        },
        {
          model: User,
          as: "user",
          attributes: ["nickname", "id"],
        },
      ],
    });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

```

### 根据博客 id 获取博客的详情

```js
async function getBlogById(req, res) {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({
      where: { id, isDeleted: false },
      attributes: {
        exclude: ["isDeleted"],
      },
      include: [
        {
          model: Tag,
          as: "tags",
          attributes: {
            exclude: ["isDeleted", "createdAt", "updatedAt"],
          },
          through: {
            attributes: [],
          },
        },
        {
          model: User,
          as: "user",
          attributes: ["nickname", "id"],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 根据博客的 id 更新博客内容

```js
async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { title, content, coverImage, tags } = req.body;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // 更新博客记录
    blog.title = title;
    blog.content = content;
    blog.coverImage = coverImage;
    // 在鉴权中间件中我们挂载了用户信息在 req 中
    blog.userId = req.user.userId;
    blog.updatedAt = +new Date();
    await blog.save();

    // 更新关联的标签
    const existingTags = await Tag.findAll({
      where: { name: tags },
    });

    if (existingTags.length === 0) {
      return res.status(404).json({ error: "Tags not found" });
    }

    await blog.setTags(existingTags);

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```


### 根据标签的 id 查找所有关联了该 id 的博客

```js
async function queryByTag(req, res) {
  try {
    const { tagId } = req.params;

    const result = await Tag.findAll({
      where: {
        id: tagId,
      },
      attributes: {
        exclude: ["isDeleted", "createdAt", "updatedAt"],
      },
      include: {
        model: Blog,
        as: "blogs",
        where: {
          isDeleted: false,
        },
        attributes: {
          exclude: ["isDeleted"],
        },
        through: {
          attributes: [],
        },
      },
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```


### 删除博客

```js
async function deleteBlog(req, res) {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // 标记博客记录为已删除状态
    blog.isDeleted = true;
    await blog.save();

    res.json({ msg: "OK" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```


上面有一些代码是可以复用的，比如查询博客列表和根据 id 查找博客详情的那一堆过滤字段，如果觉得有必要的话可以自己封装一下。

### 测试接口

#### 创建博客

这里的 tags 我们上传标签名数组，上一小节中我们创建过一个 React 标签，封面图可以调用我们上一章中完成的上传文件接口，上传到 OSS 后会得到一个在线地址，然后把这个地址塞到这里就行了

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11489965db124a63a405bd4856ec3c25~tplv-k3u1fbpfcp-watermark.image?)

创建完成后我们看到接口把创建的信息返回了

#### 获取博客列表

这里我们可以在请求 url 上加上分页信息，如果不加就是默认第一页和10条数据

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb0fbe26459a433097258e3fd63d2c37~tplv-k3u1fbpfcp-watermark.image?)

请求后可以看到把博客数量，标签信息、用户信息、博客信息都返回来了

#### 根据博客 id 获取博客的详情

这里我们在 url 中加上刚刚创建的那条博客的 id，可以看到只返回了这个博客的信息

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b64f512bbb7c4d3d9962d7f17a9ebeb6~tplv-k3u1fbpfcp-watermark.image?)

#### 根据博客的 id 更新博客内容

url 中带上对应需要更新的博客的 id，tags 如果需要更新的话需要额外多创建几个 tag

我们这里多添加一个 JS tag

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e042b0a8cad43d4bbdd1805189c2f68~tplv-k3u1fbpfcp-watermark.image?)

然后我们这里更新了 title、content、coverImage、tags 字段, tags 中多加了一个 JS

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9db87c6eb86d4f35ab0003e87ee92a75~tplv-k3u1fbpfcp-watermark.image?)

因为这里我们没返回 tags 的信息，所以我们再去查询一下这条博客，可以看到 tags 已经被更新了


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f64e973f59da43bfb94218e1e71d0c26~tplv-k3u1fbpfcp-watermark.image?)

#### 根据标签的 id 查找所有关联了该 id 的博客

我们这里多创建一个博客 id 为21，然后把 React 标签也关联进去，这时候再调用这个接口，React 标签下应该会有两条博客，id 为别为 20 和 21 那么就是对的


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/80b516a5fbcd4a578c9e4730c3d3cd3b~tplv-k3u1fbpfcp-watermark.image?)

这时候我们再去调用这个查找关联标签的博客这个接口，url 入参带上 React 这个标签的 id。 我们看到结果中确实返回了2条数据，后续数据多了的话也可以给这个接口加上分页

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aefbba3ef8284473a983a6aef319db98~tplv-k3u1fbpfcp-watermark.image?)

#### 删除博客

我们这里把 id 为 21 的博客给删一下，删除完成后返回了 ok，然后我们再去调用一下查询接口看看

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c1e2fdd964064720ba0cfabfa13a3202~tplv-k3u1fbpfcp-watermark.image?)

再去查询时发现 count 变为 1 了，数据也只返回了一条，说明软删除成功了

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d4eb85c70ea4326a239fa378e1207b9~tplv-k3u1fbpfcp-watermark.image?)


## 总结

> 前面三章的内容在这里：

- [【Node.js实战】Express 从零搭建博客系统(一)](https://juejin.cn/post/7240342069997715511)
- [【Node.js实战】实现登录注册-Express 搭建博客(二)](https://juejin.cn/post/7242676549735202874)
- [【Node.js实战】文件上传-Express 搭建博客(三)](https://juejin.cn/post/7244098228248592445)

再加上本章内容，刚好完成了四个章节，全文约 3W5+ 字

我们完成的内容有：
- Mysql 数据库搭建
- Docker 管理容器
- 登录注册及接口鉴权
- 文件本地上传/阿里云OSS上传
- 标签管理、博客管理

该系列暂时先告一段落了~ 说实话，不知道是不是因为写的不好，这个系列的文章没啥人看，还是说大家都已经会了这些了，我写的太简单了哈哈哈，没关系，这也是我给自己以前学习的知识做一下总结。在总结的过程中我还是有了解到一些新的东西的。

远方的风景很好，但也别忘偶尔驻足看看眼前的景色，有时候你会有意想不到的收获。

后续应该会去写一些 Nest.js 相关的内容了，学习 Express.js 对于学习 Nest.js 也有很大的好处，因为 Nest.js 底层其实还是 Express~ 好了，那就祝大家后续学习愉快~
