## 简介

正如 WebAssembly 这个名字一样，它里面带着 "Web" ，在一开始它确实是为了解决网页的密集型计算性能和复用其它语言的代码到网页上这些问题而诞生的，但是不仅仅如此，它其实也能跑在任何非 Web 环境之下。比如我们前端常用的 Node.js 就支持直接运行 WASM 模块，因为在 V8 引擎里面已经内置了 WASM 运行时，除此之外，我们也可以直接使用专门的 WASM 运行时来运行其代码，比如用 Rust 编写的 Wasmer、Wasmtime 还有使用 C++ 编写的 WasmEdge。运行时提供了 WASM 模块执行的环境，并且运行时本身也是可以跨平台的，这就可以真正实现 `Write once, run everywhere` 的目标，绝大多数的服务端语言都是可以编译成 WASM 模块的，但是最推荐的还是 C/C++/Rust，因为它们没有自带 GC，编译出来的 WASM 会相对更小。

和在浏览器中的 WASM 不同，服务端中的 WASM 可以通过 WASI (WebAssembly System Interface)来调用系统接口。有了 WASI 能够做些什么事情?

- **跨平台应用程序和游戏：**也就是说你编写的程序或者游戏，放到任何安装了 Wasm 运行时的环境都能够运行，比如物联网设备、Linux系统、MacOS系统、Windows系统等等。
- **在不同平台进行代码复用：**一些通用的代码库，不管是电脑、移动设备、服务器、物联网设备，一套代码就能低成本运行到任何平台。
- **使用单运行时运行多种编程语言的代码：**比如使用 Wasmtime 这一个运行时，就能够运行 Rust、C、C++、Python、.Net、Go 等语言编译出来的代码。
- **提供容器化：**在部分场景可以代替 Docker 来作为"容器"来运行，Wasm 因为更加轻量，可以比 Docker 容器的启动时间更快，目前在 Serverless 领域也有对应的框架实现了，比如 Spin。
- **安全沙箱：**Wasm 运行时可以理解为一个安全沙箱，当你不知道需要运行的代码是否安全，就可以通过 Wasm 运行时去做一些隔离和限制，提供有限的 API 支持，比如只提供文件访问权限。

![image-20231212231946574](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231212231946574.png)

说了那么多，我们直接来上手感受一下 Wasmtime 这个运行时。

## 依赖环境

- Wasmtime 运行时
- Rust 开发环境

## Hello World

首先对世界Say一下 Hello，需要先使用 cargo 初始化一个 Rust 项目

```
cargo new wasmtime-demo
```

然后在 src/main.rs 中能看到 Hello world 的代码

```rust
fn main() {
    println!("Hello, world!");
}
```

接下来就使用 rustup 来将它编译到 wasi 模块，编译之前需要先安装一下编译环境

```
rustup target add wasm32-wasi
```

安装好之后就可以对 main.rs 进行编译了

```
rustc src/main.rs --target wasm32-wasi
```

编译完成之后就能看到项目根目录下多了一个 main.wasm 文件，然后就能直接使用 wasmtime 去执行它了。

```
wasmtime hello.wasm
```

最后就能够在控制台上看到 Hello world，一个简单的流程就跑通了。

![image-20231212233758685](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231212233758685.png)

然后你现在编译出来的这个 wasm 文件，放到任何安装了 wasmtime 运行时的设备上都能够跑起来，并且可以省去了跨平台编译时的时间成本。

## 编写一个跨平台的命令行工具

这个命令行工具很简单，就是用于扫描 node_modules 里面所有包的 package.json 文件，然后输出到另一个文件中，并统计耗时。

## 运行在 Wasmtime 上





## 总结
