## TEO 是什么?

Teo 是下一代的开源 Web 框架，它的第一次提交记录在 22年5月，是一个特别新的框架，关键还是个国产框架。

目前它支持三种编程方式：Node.js、Python 和 Rust。它受到了 GraphQL 和 Prisma 的启发且易于阅读，只需要在一份 schema 文件中编写对应的模型即可生成对应的接口，所见即所得，所写即所想，使用了它，开发一个 Web 服务器会变得非常非常简单，到底有多简单呢？ 一会我们下面再细看。

## 快速开始一个 Demo

我们这里就用 Rust 的 cargo 来进行安装，首先你得有 Rust 的环境，这个自己去官网装就好。然后我们使用 cargo 来安装 teo。

> 注意 Rust 的版本必须要高于 1.74

```
cargo install teo
```

安装完成后查看一下版本号

```
cargo teo --version

# 输出
# teo Teo 0.2.12 (Rust 1.76.0) [CLI]
```

创建项目文件

```
mkdir teo-demo
# 进入文件夹
cd teo-demo
# 新建一个 schema 文件
touch schema.teo
```

然后在 schema.teo 编写这些代码，如果没有代码高亮，可以在 vscode 中安装 teo 插件(我写下这篇文章的时候这个插件下载量还没超过100，目前用的人还比较少)

这里就以一个用户发表文章的场景作为例子，首先编写下面这样的一段 schema 代码

```json
connector {
  provider: .sqlite,
  url: "sqlite::memory:"
}
 
server {
  bind: ("0.0.0.0", 5050)
}
 
model User {
  @id @autoIncrement @readonly
  id: Int
  @unique @onSet($if($presents, $isEmail))
  email: String
  name: String?
  @relation(fields: .id, references: .authorId)
  posts: Post[]
}
 
model Post {
  @id @autoIncrement @readonly
  id: Int
  title: String
  content: String?
  @default(false)
  published: Bool
  @foreignKey
  authorId: Int
  @relation(fields: .authorId, references: .id)
  author: User
}
```

接下来启动服务器

```
cargo teo serve
```

启动成功后控制台输出下面的内容表示启动成功了，这时候我们就能直接开始编写请求了

```
sqlite connector connected for `main` at "sqlite::memory:"
Teo 0.2.12 (Rust 1.76.0, CLI)
listening on port 3000
```

## 使用 Postman 请求接口

我们往 `localhost:3000/USER/create`发送一个 POST 的 json 请求试试

![image-20240306221350342](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20240306221350342.png)

请求体：

```json
{
  "create": {
    "email": "puffmeow99@gmail.com",
    "name": "puffmeow",
    "posts": {
      "create": [
        {
          "title": "关注《泡芙玩编程》",
          "content": "介绍一下 TEO"
        }
      ]
    }
  },
  "include": {
    "posts": true
  }
}
```

响应内容

```json
{
    "data": {
        "id": 2,
        "email": "puffmeow99@gmail.com",
        "name": "puffmeow",
        "posts": [
            {
                "id": 3,
                "title": "关注《泡芙玩编程》",
                "content": "介绍一下 TEO",
                "published": false,
                "authorId": 2
            }
        ]
    }
}
```



这就完成了一个接口请求？？？ 非常简单啊有木有，只需要写了模型就能写对应的接口请求了，这不就是我们之前提到的所写即所得吗？这么一个简单的 schema 其实就能够完成平时大部分的需求编写了。

类似的还有 createMany 接口、 findMany 接口、update 接口等。

我们再看一个 update 的例子

![image-20240306222056504](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20240306222056504.png)

请求体：

```json
{
    "where": {
        "id": 2
    },
    "update": {
        "email": "puffmeow88@gmail.com",
        "name": "22222222",
        "posts": {
            "update": {
                "where": {
                    "id": 3
                },
                "update": {
                    "content": "我来介绍 TEO 的update 啦"
                }
            }
        }
    },
    "include": {
        "posts": true
    }
}
```

响应结果：

```json
{
    "data": {
        "id": 2,
        "email": "puffmeow88@gmail.com",
        "name": "22222222",
        "posts": [
            {
                "id": 3,
                "title": "关注《泡芙玩编程》",
                "content": "我来介绍 TEO 的update 啦",
                "published": false,
                "authorId": 2
            }
        ]
    }
}
```

## 总结

除了上面的 schema 编写接口的方式以外， TEO 还提供了编写源码的方式。目前其实官方网站的内容也不是非常的完善，大家也可以去参考一下官网，我觉得这也是一种比较新颖的服务端方式，如果能配合可视化界面来编写 schema，以后一些简单的需求直接也能够以拖拉拽的形式去完成接口的编写，这也是未来的一个想象方向。或者说以后拿一堆常用的 schema 来训练喂饱 AI， 让 AI 来直接修改 schema 然后就能完成一些简单的需求了。更多的场景大家可以自己想象一下，我觉得这个还是比较有前景的。