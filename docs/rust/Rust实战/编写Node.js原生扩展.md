## 前言

本文将从零带你去使用 Rust 构建一个 Node.js 原生扩展(Native Addon)，为什么要学这个？ 正如我们之前所提到的，Rust 可以给 Node.js 打开性能逃生的通道。当我们使用 Node.js 去写 Web 服务或者一些提效工具遇到 CPU 密集计算的时候，这时候就可以上 Rust 了。

如果你感兴趣的话可以去 npm 搜一下 @puffmeow/rusty-schema2ts 这个包，它就是用 Rust napi-rs 写的。

废话不多说，下面我们就来看看如何通过 Rust 构建一个 Npm 包。

## 前置条件

- Rust 环境：去官网自行安装
- Node.js 环境：去官网自行安装
- @napi-rs/cli：全局安装 `npm install -g @napi-rs/cli`

## 示例项目

这里我们直接从零用一个例子来讲讲如何开始

### 初始化项目

![image-20230812171630131](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230812171630131.png)

可以看着上面这个图的步骤来：

1. `napi new`
2. 输入下包名，推荐去 npm 上创建一个自己的组织，我们这里就用 @puffmeow，然后包名就是 @puffmeow/example
3. 当前项目的目录名
4. 选择要支持的平台，Native Addon 是不能跨平台的，所以要选择跨平台构建，这里我们直接按 a 进行全选，全平台构建
5. 这个我们如果使用 Github workflow 来构建的话，就选上，到时候会通过 github workflow 把所有的包放到容器中进行跨平台构建
6. 等待项目初始化完成

```
test
└── example
    ├── Cargo.toml
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
