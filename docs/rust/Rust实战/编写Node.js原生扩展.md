## 前言

本文将带你了解 Node.js 原生扩展(Native Addon)，并从零去使用 Rust 构建一个 Node.js 原生扩展。

Node.js 原生扩展可以给 Node.js 提供一个性能逃生通道，当我们使用 Node.js 遇到性能瓶颈或 CPU 密集计算场景的时候，便可以编写 Native Addon 解决这个问题了，比如 swc(对应 babel)、Rspack(对应 Webpack)、Biome(对应 eslint、prettier、babel、webpack 等，目标是代替我们所熟悉的所有前端工具链...)，上面提到的工具链性能比使用纯 Node.js 编写的对应功能的包都有了极大的提高，同时 Native Addon 是支持多线程的，你编写的多线程代码在 Node.js 中一样可以跑（脱离了 V8 引擎单线程执行的限制），正如 [swc](https://swc.rs/) 宣传的那样，它在单线程下比 babel 快 20 倍，在 4 核的环境下比 babel 快 70 倍，那么这就解决了 Node.js 不擅长 CPU 密集型的问题。

在前端架构和工具领域目前 Rust 已经差不多是标配了，Vite 底层使用的 Rollup 的代替品 [Rolldown](https://github.com/rolldown-rs/rolldown_legacy/issues/131) 也正在开发中，不过目前还没开放出来，另外还有最近几天火起来的 [Oxlint](https://github.com/oxc-project/oxc/tree/main) (一个比 Eslint 快 50-100 倍的 Lint 工具)，连尤大都在夸。

![image-20231217181133162](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231217181133162.png)

不过要是你说在日常开发中也用不到去接触这么些 Rust 写的底层的工具库啊，那来了解了解总可以吧，以后前端工具全部 Rust 化了，你还能知道怎么去给一些工具去写扩展插件来做更多的事情。

除了在前端工具之外，其实也有一些库把它用在服务端了，毕竟目前在国外 Node.js 已经是最常用的服务端环境了；另外如果在 SSR 场景中，如果只是想部分使用 Rust 来提速，那么可以使用 Rust 去做解析字符串和模板引擎一些需要吃 CPU 的部分，也能获得一部分的性能收益，但是如果想要获得更高的性能收益，那么整个 SSR 渲染后端都可以替换为 Rust，从公司层面来说可以减少一部分机器成本，让单个机器可以承载更多的 QPS 。

啥，你说为啥不选用别的语言而用 Rust？一方面是 Rust 其实上手之后开发效率真不低，一些最难最复杂的部分在日常应用层面开发基本都不会接触到，比如写一个链表什么的都有现成封装好的库了，另外很多应用层框架都已经帮你处理掉生命周期的事情了；一方面是 Rust 拥有比别的语言更好的跨语言调用特性；另一方面 Rust 拥有类似于前端的工具链 cargo 以及和 TypeScript 相似的类型系统，如下:

```rust
// Rust 声明变量
let a: &str = "Hello world";
// TypeScript 声明变量
let a: string = "Hello world";

// Rust 泛型函数
pub fn walkdir<T>(entry: String, callback: T)
where
  T: Fn(String) -> Result<()>,
{}
// TypeScript 泛型函数
export function walkdir<T extends (s: string) => void>(entry: string, callback: T) {}
```

C/C++、Java、Go 这些常见语言都是类型前置声明，对比 TS 的后置类型声明，对于前端开发者来说那肯定还是 Rust 更加亲切了。

最后虽然现在可以使用 AI 来辅助学习了，不过目前 GPT 模型里暂时还没这包括这一部分最新的语料，另外你没了解过这块知识，也不知道怎么去问 AI，所以来了解一下总没错的。

## 前置知识

在编写我们的原生扩展之前，我们先了解一下它的相关知识。

Native Addon 是用 C/C++ 编写的动态链接共享对象。 require() 函数可以将原生扩展加载为普通的 Node.js 模块，它提供了 JavaScript 和 C/C++ 库之间的接口，其实本质上就是我们能够直接在 JS 中调用原生语言编译出来的 xxx.node 二进制文件里导出的方法，这些方法称为 ABI（Application Binary Interface 应用二进制接口）。

编写 Native Addon 需要依赖 Node.js 提供的 [Node-API](https://nodejs.org/api/n-api.html) ，它是 Node.js 提供的编写原生扩展的 API，不和底层 JS 运行时进行绑定，在 Node.js 中独立于 V8 引擎，这样做是为了与 JS 运行时引擎的变化相隔离开，防止因为引擎的一些迭代导致 API 不稳定。

其实在日常的项目开发中，我们可能都已经已经接触到过不少的 Native Addon 了，举个例子，比如 [node-sass](https://www.npmjs.com/package/node-sass)、[sqlite3](https://www.npmjs.com/package/sqlite3?activeTab=code) 这两个 C++ 编写的库，在它们的构建产物中，你会看到 C++ 代码和 bingding.gyp 文件，bingding.gyp 用于配置 Native Addon 编译。

![image-20231217141423921](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231217141423921.png)

当我们进行 `npm install node-sass` 时，这个包就会下载到用户本地并进行编译，然后构建出符合用户当前平台的 .node 动态链接库，但是很多人用这个包的时候往往会进行各种莫名其妙的报错，这是因为 node-gyp 需要依赖 Python 环境和 C++ 构建工具链，这一步就会把挺多人给劝退掉；另外假如环境顺利安装了，而一旦当这个库变得庞大，在本地构建的时间也会变得非常的长，有一些没耐心的用户可能会觉得电脑卡死了，索性就放弃了，所以这也是其中一个为什么在以前没有大规模去普及 Node.js Native Addon 的原因。

得益于 Rust 强大的工具链和它本身的语言特性，用它来编写 ABI、FFI(Foreign Function Interface 外部函数接口) 都是非常方便的，现在社区上有了最流行的使用 Rust 来编写 Node.js Native Addon 的框架 [NAPI-RS](https://napi.rs/)，使用它来编写原生扩展非常的方便，所以社区上目前新兴的高性能 Node.js 原生扩展都使用 Rust 来进行编写了。而 Node.js 和 Node-API 本身都是使用 C++ 来进行编写的，那么 Rust 想要去调用 C++ 的方法就需要通过 FFI 来进行实现，NAPI-RS 这个框架就是提供了 Rust 版本的 Node-API 的封装，底层通过调用 Node-API，简化了用户对于操作原生 Node-API 的上手成本。 这个框架目前在下面这些工具中都有进行使用：

![image-20231217152027097](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231217152027097.png)

下面我们就从零讲讲如何去使用 Rust 来编写原生扩展。

## 前置条件

- Rust 环境：去[官网](https://www.rust-lang.org/)自行安装
- Node.js 环境：去[官网](https://nodejs.org/en)自行安装
- @napi-rs/cli：全局安装 `npm install -g @napi-rs/cli`

## 示例项目

这里我们直接从零用一个例子来讲讲如何开始

### 1.初始化项目

![image-20230812171630131](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230812171630131.png)

可以看着上面这个图的步骤来：

1. `napi new`
2. 输入下包名，推荐去 npm 上创建一个自己的组织，我们这里就用 @puffmeow，然后包名就是 @puffmeow/example
3. 当前项目的目录名
4. 选择要支持的平台，Native Addon 是不能跨平台的，所以要选择跨平台构建，这里我们直接按 a 进行全选，全平台构建
5. 这个我们如果使用 Github workflow 来构建的话，就选上，到时候会通过 github workflow 把所有的包放到容器中进行跨平台构建和发布
6. 等待项目初始化完成

```
test
└── example
    ├── Cargo.toml
    ├── .github
    │   └── CI.yml
    ├── __test__
    │   └── index.spec.mjs
    ├── build.rs
    ├── npm
    │   ├── android-arm-eabi
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── android-arm64
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── darwin-arm64
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── darwin-universal
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── darwin-x64
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── freebsd-x64
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── linux-arm-gnueabihf
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── linux-arm64-gnu
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── linux-arm64-musl
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── linux-x64-gnu
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── linux-x64-musl
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── win32-arm64-msvc
    │   │   ├── README.md
    │   │   └── package.json
    │   ├── win32-ia32-msvc
    │   │   ├── README.md
    │   │   └── package.json
    │   └── win32-x64-msvc
    │       ├── README.md
    │       └── package.json
    ├── package.json
    ├── rustfmt.toml
    ├── src
    │   └── lib.rs
    └── yarn.lock
```

对于目录的解释：
其中 npm 目录下的包用来放不同平台构建出来的 .node 文件并通过 workflow 流水线发布到 NPM 上。
用户使用的时候就会根据自己的平台，去自动拉取对应平台的 .node 包，比如我的电脑是 Windows x64 系统，到时候执行 `npm install @puffmeow/example` 的时候，就会自动去拉取 `@puffmeow/example-win32-x64-msvc` 这个包，这个包里的 .node 文件里导出的方法就能直接被 JS 进行调用了，和上文提到的使用 node-gyp 在用户本地构建的方式不一样，NAPI-RS 可以通过流水线在云端进行构建并编译，这就避免了之前所说的 node-gyp 存在的问题，并大大节省了用户的本地构建时间。

### 2.编写业务代码

去到 `src/lib.rs` 编写你要写的代码即可，默认 NAPI-RS 脚手架会给你初始化一个 sum 方法，使用 [napi] 属性宏的方法可以暴露到 JS 侧。

```rust
#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

#[napi]
pub fn sum(a: i32, b: i32) -> i32 {
  a + b
}

```

### 3. CI 脚本

在.github 目录下，脚手架会给你默认生成一个 CI.yml 脚本，里面包含了在不同平台的容器中进行构建的配置，另外它会默认在你提交代码到主分支并且提交信息为 x.x.x 的时候自动帮你打包构建并发布到 NPM 中，为了能够自动把包发布到 NPM 上，还需要配置一下 NPM Token。

### 4.配置 NPM Token 到 Github Action

打开 NPM 的 Access Tokens

![image-20231215234258269](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231215234258269.png)

然后创建一个 Classic Token，然后类型选择 Automation，最后创建后把得到的 Token 复制到你 Git 项目下的 Setting 对应的配置里，如下图

![image-20231215234342603](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231215234342603.png)

在对应项目的 setting 里加上 NPM_TOKEN，然后配置这一步就大功告成了

![image-20231215234528238](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231215234528238.png)

### 5.发布

现在你可以在你初始化的项目里尝试性的发布一下，比如把包的版本号改成 0.0.1，然后提交信息 0.0.1，把改动 push 到主分支上，等待流水线构建完成。到了这里你就能够成功的发布你的第一个使用 Rust 编写的 NPM 包了，现在包里默认会导出一个 sum 方法，构建完成之后，把这个包安装下来，就能直接调用这个包里导出的 sum 方法了。

## 其它

之前我自己也写了两个 Rust 编写的 Native Addon，也可以去做下参考，分别是：

- [@puffmeow/rusty-schema2ts](https://github.com/PuffMeow/rusty-schema2ts)：将 json-schema 转换成 TS 类型的库，性能比纯 JS 版的要快 1 倍。
- [@puffmeow/rusty-walkdir](https://github.com/PuffMeow/rusty-walkdir)：遍历目录，对 Rust 版的 walkdir 进行了封装，暴露给 node.js 使用

NAPI 官方也提供了一些包，比如 [node-rs](https://github.com/napi-rs/node-rs)， 想要自己编写 Native Addon 的话可以去参考一下，里面提供的包对比 JS 版都有了很大的性能提升。

## 总结

使用 Rust 编写 Native Addon 的好处上面也提到了，另一方面就是你可以把一些 Rust 生态的库提供给 Node.js 使用，让别的开发者能够享受到更高性能的前端工具链，这对于整个前端社区来说都是有好处的，毕竟时间就是金钱。之前我也试用了一下字节跳动开源的 Rspack，在一个中大型项目 (5W 行代码左右)，使用 Webpack 冷启动大概在 15s 左右，使用 Rspack 在 1s 内就能启动完成，热更新甚至在 100ms 以内，这还是在没有任何优化配置的情况下，这对于前端社区来说无疑是极大的进步，前端生态的工具也会因此进一步的走向更成熟。最后，Rust 就算不想花时间学习，也是需要去了解一下的，毕竟前端社区未来趋势就是锈化。
