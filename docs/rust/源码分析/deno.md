# 深入浅出 Deno，JS 运行时是如何实现的？

## 为什么要了解 Deno 源码？

Deno 和 Node.js 都是同一个作者 Ryan Dahl， Ryan Dahl 就是因为对 Node.js 感到不满，特别是在安全性和 package.json 的设计上，所以就另起炉灶搞了个 Deno。Deno 、 Node.js 或者 Bun.js ，这些其实都类似，都是一个 JavaScript 运行时，所以学习这几个中的任意一个，都可以了解到 JS 运行时的一些设计理念和思想。这里我们就以 Deno 为例来讲讲。

Deno 对比 Node.js 有哪些特点？

- Deno 原生内置了 TS 支持、lint/benchmark/格式化/测试/文档 等工具、默认零配置可开箱即用、标准 Web API 的支持
- 原生内置通过 URL 来加载模块（Node.js 于 17.6 版本也开启了实验性的支持）
- 安全，访问本地文件/网络/调用 FFI 等操作需要授权(Node.js 20 也支持这个特性了)

还有一个要说的点，现在 Deno 也开始兼容 NPM 了，也可以使用 package.json 和安装 node_modules，但是这是可选的，这看似有点违背了 Deno 一开始设计的初衷，但是如果不这样做，就意味着丢掉了 NPM 庞大的生态体系，导致用户量会一直上不来，这也有 [一篇文章讲了为什么 Deno 要支持 NPM](https://deno.com/blog/package-json-support)，目前 Deno 的网络引入模块功能还有一些缺陷，比如会导致重复依赖引入，但是这已经在 Deno 官方的解决清单里了，未来版本会解决。

其它废话就不多说了，直接来进入主题，了解一下实现一个 JS 运行时的原理吧

## 基本架构

首先我们先了解一下 Deno 的基本架构，主要大模块分为下面这几个：

![image-20230415230850930](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230415230850930.png)

## 启动流程

下面我们来看下启动一个 js 文件的主流程，假设我们有一个 main.js 文件，里面有一个读文件操作

```
deno
├── main.js
└── test.txt
```

main.js

```js
const data = await Deno.readTextFile("test.txt");
console.log(data);
```

test.txt

```
Hello World
```

类似于运行 `node main.js`， 此时控制台运行 `deno run -A main.js`，就能看到 `"Hello World"` 的输出了，

这就是一个完整的 deno 运行流程。 在运行的时候我们需要加上 -A 参数或者 --allow-read 参数来给予 Deno 访问文件的权限， -A 表示赋予所有权限，包括网络、读写文件、系统信息、ffi 等。

接下来我们就从源码中看一下这个运行过程是如何完成的。

## 源码解析

首先我们从命令行 Cli 模块入手，以下代码经过精简，[源码在这儿](https://github.com/denoland/deno/blob/main/cli/main.rs#L233)

```rust
// 主要命令行运行入口
pub fn main() {
  // 收集命令行参数
  let args: Vec<String> = env::args().collect();

  // 返回一个 future 异步任务
  let future = async move {
    // 处理权限，比如 --allow-read/--allow-write/--allow-net 等
    // 当输入 deno run --allow-read main.ts，会解析对应参数然后全部写入到 flags 变量中
    let flags = flags_from_vec(args).unwrap();
    // 初始化 v8 引擎参数，如果参数设置有错就直接退出
    init_v8_flags(&flags.v8_flags, get_v8_flags_from_env());
    // 运行命令行 比如 deno run 匹配 DenoSubcommand::RUN
    run_subcommand(flags).await
  };
  // run_local创建 tokio 异步运行时，最大线程数 32 个
  let exit_code = unwrap_or_exit(run_local(future));
  // 如果运行错误就退出
  std::process::exit(exit_code);
}
```

当运行了 `deno run` ，就会进入到 `run_subcommand` 中，同时把解析好的命令行参数传递进去，`run_subcommand` 返回一个异步任务最后交给 tokio 去执行。

下面我们来看一下 `run_subcommand` 中的代码，我们可以看到主要是执行了 `run_script` 这个方法，并把 flags 命令行参数往里面传递

```rust
async fn run_subcommand(flags: Flags) -> Result<i32, AnyError> {
  match flags.subcommand.clone() {
    DenoSubcommand::Run(run_flags) => {
      tools::run::run_script(flags).await
    }
  }
}
```

继续往里面去看，可以看到这个函数是运行 JS 文件的地方，主要是先创建一个全局的状态管理对象，然后拿到 JS 的主入口模块，检测运行的权限，然后创建一个执行的 Worker，最后再运行起来

```rust
/// 运行指定的 js 文件
pub async fn run_script(flags: Flags) -> Result<i32, AnyError> {
  // ProcState 存储一个 deno 实例的状态，它的状态会被所有已经创建的 worker 共享
  // 内部存储了 deno 中会用到的二进制数据，可以跨线程传递数据的广播通道生产者和 sharedArrayBuffer
  // WASM 依赖信息，网络缓存、网络请求客户端，分析和翻译 node.js 代码，npm 的兼容和解析处理， 处理 TS 配置和类型检查，
  // 构建模块的依赖关系，处理模块以及预加载需要的数据等操作
  let ps = ProcState::from_flags(flags).await?;

  // 主入口模块，解析后返回一个 URL ，有多种解析模式，命令行标准输入、npm、远程、本地文件等
  let main_module = ps.options.resolve_main_module()?;

  // 获取运行的权限，具有内部可变性，可以跨线程，比如可以传递到 Web Worker
  let permissions = PermissionsContainer::new(Permissions::from_options(
    &ps.options.permissions_options(),
  )?);
    
  // 创建一个运行 js 程序的 worker，把主入口模块和权限往里传
  let mut worker = create_main_worker(&ps, main_module, permissions).await?;

  let exit_code = worker.run().await?;
  Ok(exit_code)
}
```

接下来我们再来看下 `create_main_worker` 这个函数，里面创建用于 JS 运行起来的工作者线程

```rust
pub async fn create_main_worker(
  &self,
  main_module: ModuleSpecifier,
  permissions: PermissionsContainer,
) -> Result<CliMainWorker, AnyError> {
  self
    .create_custom_worker(
      main_module,
      permissions,
      vec![],
      Default::default(),
    )
    .await
}
```

